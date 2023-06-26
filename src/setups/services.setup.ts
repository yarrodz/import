import { Server as IO } from 'socket.io';
import ColumnsService from '../modules/columns/columns.service';
import DatasetsRepository from '../modules/datasets/datasets.repository';
import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import ImportProcessesService from '../modules/import-processes/import-processes.service';
import ImportsRepository from '../modules/imports/imports.repository';
import ImportsService from '../modules/imports/imports.service';
import TransferHelper from '../modules/transfer/transfer.helper';
import TransferService from '../modules/transfer/transfer.service';
import SQLColumnsService from '../modules/columns/columns/sql-columns.service';
import TransferSQLService from '../modules/transfer/transfers/transfer-sql.service';

export default function setupServices(
  io: IO,
  datasetsRepository: DatasetsRepository,
  importsRepository: ImportsRepository,
  importProcessesRepository: ImportProcessesRepository,
  maxAttempts: number,
  delayAttempt: number,
  limit: number
): {
  importsService: ImportsService;
  importProcessesService: ImportProcessesService;
} {
  const sqlColumnsService = new SQLColumnsService();
  const columnsService = new ColumnsService(sqlColumnsService);
  const transferHelper = new TransferHelper(
    io,
    datasetsRepository,
    importProcessesRepository
  );
  const transferSQLService = new TransferSQLService(
    importProcessesRepository,
    transferHelper
  );
  const transferService = new TransferService(
    io,
    importProcessesRepository,
    transferSQLService,
    maxAttempts,
    delayAttempt,
    limit
  );
  const importsService = new ImportsService(
    importsRepository,
    importProcessesRepository,
    columnsService,
    transferService
  );
  const importProcessesService = new ImportProcessesService(
    importProcessesRepository,
    importsRepository,
    transferService
  );

  return {
    importsService,
    importProcessesService
  };
}
