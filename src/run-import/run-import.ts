import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import { IImportProcessDocument } from '../modules/import-processes/import-process.schema';
import { ImportSource } from '../modules/imports/enums/import-source.enum';
import { IImportDocument } from '../modules/imports/import.schema';
import { apiImport } from './api.import';
import { imapImport } from './imap.import';
import { sqlImport } from './sql.import';
import { ImportStatus } from '../modules/import-processes/enums/import-status.enum';
import Websocket from '../utils/websocket/websocket';
import emitProgress from '../helpers/emit-progress';

const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY_TIME = 1000;

export default async function runImport(
  impt: IImportDocument,
  process: IImportProcessDocument
): Promise<void> {
  try {
    await run(impt, process);
  } catch (error) {
    return handleImportFailure(error, impt, process);
  }
}

async function run(
  impt: IImportDocument,
  process: IImportProcessDocument
): Promise<void> {
  switch (impt.source) {
    case ImportSource.MYSQL:
    case ImportSource.POSTGRESQL:
    case ImportSource.MICROSOFT_SQL_SERVER:
    case ImportSource.ORACLE:
    case ImportSource.MARIADB:
      await sqlImport(impt, process);
      break;
    case ImportSource.API:
      await apiImport(impt, process);
      break;
    case ImportSource.IMAP:
      await imapImport(impt, process);
      break;
    default:
      throw new Error('Unexpected import source');
  }
}

async function handleImportFailure(
  error: Error,
  impt: IImportDocument,
  process: IImportProcessDocument
) {
  const refreshedProcess = await ImportProcessesRepository.findById(
    process._id
  );

  if (refreshedProcess.attempts !== MAX_ATTEMPTS) {
    await ImportProcessesRepository.update(process._id, {
      attempts: refreshedProcess.attempts + 1
    });
    await delayAttempt();
    return await runImport(impt, refreshedProcess);
  } else {
    const failedProcess = await ImportProcessesRepository.update(process._id, {
      status: ImportStatus.FAILED,
      errorMessage: error.message
    });

    const io = Websocket.getInstance();
    emitProgress(io, process._id.toString(), failedProcess);
  }
}

function delayAttempt() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ATTEMPT_DELAY_TIME);
  });
}
