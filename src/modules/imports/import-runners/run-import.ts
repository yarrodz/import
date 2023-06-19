import ImportProcessesRepository from '../../import-processes/import-processes.repository';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import { ImportSource } from '../enums/import-source.enum';
import { IImportDocument } from '../import.schema';
import { apiImport } from './api.import';
import { imapImport } from './imap.import';
import { sqlImport } from './sql.import';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import Websocket from '../../../utils/websocket/websocket';
import emitProgress from '../helpers/emit-progress';

const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY_TIME = 1000;

export default async function runImport(
  impt: IImportDocument,
  process: IImportProcessDocument
): Promise<void> {
  try {
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.SQLITE:
      case ImportSource.MARIADB:
      case ImportSource.ORACLE:
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
  } catch (error) {
    return handleImportFailures(error, impt, process);
  }
}

async function handleImportFailures(
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
    emitProgress(io, process._id as string, failedProcess);

    throw new Error(
      `Import after trying to rerun ${MAX_ATTEMPTS} times returned an error: ${error.message}`
    );
  }
}

function delayAttempt() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ATTEMPT_DELAY_TIME);
  });
}
