import { Types } from 'mongoose';

import Import from './import.schema';
import ImportProcess from '../import-processes/import-process.schema';
import { IImportModel } from './import.schema';
import { IFieldModel } from './sub-schemas/field.schema';
import { IImportProcessModel } from '../import-processes/import-process.schema';
import { ImportSource } from './enums/import-source.enum';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import { receivePostgresColumns } from './columns/postgres.columns';
import { postgresImport } from './executors/postgres.import';
import { apiImport } from './executors/api.import';
import { imapImport } from './executors/imap.import';
import { IColumn } from './intefaces/column.interface';
import { receiveApiColumns } from './columns/api.columns';

const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY = 5000;

export async function connect(data: any) {
  const imp = await Import.create(data);
  return await receiveColums(imp);
}

export async function setFields(
  importId: Types.ObjectId,
  fields: IFieldModel[]
) {
  await Import.updateOne({ _id: importId }, { fields });
}

export async function start(importId: Types.ObjectId) {
  const imp = await Import.findById(importId);
  const importProcess = await ImportProcess.create({
    unit: imp.unit,
    import: imp._id
  });

  try {
    await run(imp, importProcess);
  } catch (error) {
    await catchError(error, imp, importProcess);
  }
}

export async function pause(importProcessId: Types.ObjectId) {
  await ImportProcess.updateOne(
    { _id: importProcessId },
    { status: ImportStatus.PAUSED }
  );
}

export async function reload(importProcessId: Types.ObjectId) {
  const importProcess = await ImportProcess.findById(importProcessId);
  const imp = await Import.findById(importProcess.import);
  await importProcess.updateOne({
    status: ImportStatus.PENDING
  });

  try {
    await run(imp, importProcess);
  } catch (error) {
    await catchError(error, imp, importProcess);
  }
}

export async function retry(importProcessId: Types.ObjectId) {
  await ImportProcess.updateOne(
    { _id: importProcessId },
    {
      attempts: 0,
      status: ImportStatus.PENDING
    }
  );
  await reload(importProcessId);
}

async function receiveColums(imp: IImportModel) {
  let columns: IColumn[] = [];
  switch (imp.source) {
    case ImportSource.POSTGRESQL:
      columns = await receivePostgresColumns(imp);
      break;
    case ImportSource.API:
      columns = await receiveApiColumns(imp);
      break;
    case ImportSource.IMAP:
      break;
    default:
      throw new Error('Unexpected import source');
  }
  return columns;
}

async function run(imp: IImportModel, importProcess: IImportProcessModel) {
  switch (imp.source) {
    case ImportSource.POSTGRESQL:
      await postgresImport(imp, importProcess);
      break;
    case ImportSource.API:
      await apiImport(imp, importProcess);
      break;
    case ImportSource.IMAP:
      await imapImport(imp, importProcess);
      break;
    default:
      throw new Error('Unexpected import source');
  }
}

async function catchError(
  error: Error,
  imp: IImportModel,
  importProcess: IImportProcessModel
) {
  if (importProcess.attempts !== MAX_ATTEMPTS) {
    await importProcess.updateOne({ $inc: { attempts: 1 } });
    await sleep();
    return await reload(importProcess._id);
  } else {
    await importProcess.updateOne({
      status: ImportStatus.FAILED,
      errorMessage: error.message
    });
  }
}

async function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ATTEMPT_DELAY);
  });
}
