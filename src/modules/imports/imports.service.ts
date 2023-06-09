import { Types } from 'mongoose';

import Import from './import.schema';
import ImportProcess from '../import-processes/import-process.schema';
import { IImportModel } from './import.schema';
import { IFieldModel } from './sub-schemas/field.schema';
import { IImportProcessModel } from '../import-processes/import-process.schema';
import { ImportSource } from './enums/import-source.enum';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import { postgresImport } from './executors/postgres.import';
import { apiImport } from './executors/api.import';
import { imapImport } from './executors/imap.import';
import { IColumn } from './intefaces/column.interface';
import { receivePostgresColumns } from './columns/postgres.columns';
import { receiveApiColumns } from './columns/api.columns';

const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY = 5000;

class ImportsService {
  async connect(data: any) {
    const imp = await Import.create(data);
    const columns = await this.receiveColums(imp);
    return {
      id: imp._id,
      columns
    };
  }

  async setFields(id: Types.ObjectId, fields: IFieldModel[]) {
    await Import.findByIdAndUpdate(id, { fields });
  }

  async start(id: Types.ObjectId) {
    const imp = await Import.findById(id);
    const importProcess = await ImportProcess.create({
      unit: imp.unit,
      import: imp._id
    });

    try {
      await this.run(imp, importProcess);
    } catch (error) {
      await this.catchError(error, importProcess);
    }
  }

  async pause(processId: Types.ObjectId) {
    await ImportProcess.updateOne(
      { _id: processId },
      { status: ImportStatus.PAUSED }
    );
  }

  async reload(processId: Types.ObjectId) {
    const importProcess = await ImportProcess.findById(processId);
    const imp = await Import.findById(importProcess.import);
    await importProcess.updateOne({
      status: ImportStatus.PENDING
    });

    try {
      await this.run(imp, importProcess);
    } catch (error) {
      await this.catchError(error, importProcess);
    }
  }

  async retry(processId: Types.ObjectId) {
    await ImportProcess.findByIdAndUpdate(processId, {
      attempts: 0,
      status: ImportStatus.PENDING
    });
    await this.reload(processId);
  }

  private async receiveColums(imp: IImportModel) {
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

  private async run(imp: IImportModel, importProcess: IImportProcessModel) {
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

  private async catchError(error: Error, importProcess: IImportProcessModel) {
    if (importProcess.attempts !== MAX_ATTEMPTS) {
      await importProcess.updateOne({ $inc: { attempts: 1 } });
      await this.sleep();
      return await this.reload(importProcess._id);
    } else {
      await importProcess.updateOne({
        status: ImportStatus.FAILED,
        errorMessage: error.message
      });
    }
  }

  private sleep() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), ATTEMPT_DELAY);
    });
  }
}

export default new ImportsService();
