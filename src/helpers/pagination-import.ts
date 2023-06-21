import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import { IImportProcessDocument } from '../modules/import-processes/import-process.schema';
import { ImportStatus } from '../modules/import-processes/enums/import-status.enum';
import Websocket from '../utils/websocket/websocket';
import emitProgress from './emit-progress';
import { IPaginationFunction } from '../modules/imports/intefaces/pagination-function.interface';
import { transformDatasets } from './transform-datasets';
import { transferDatasets } from './transfer-datasets';
import { IImportDocument } from '../modules/imports/import.schema';
import { SqlConnection } from '../utils/sql/sql.connection';

export async function paginationImport(
  impt: IImportDocument,
  process: IImportProcessDocument,
  sqlConnection: SqlConnection,
  idColumn: string,
  datasetsCount: number,
  offset: number,
  limit: number,
  paginationFunction: IPaginationFunction,
  ...paginationFunctionParams: any[]
) {
  const io = Websocket.getInstance();
  const processId = process._id.toString();
  while (offset < datasetsCount) {
    const refreshedProcess = await ImportProcessesRepository.findById(
      process._id
    );
    if (!refreshedProcess || refreshedProcess.status === ImportStatus.PAUSED) {
      sqlConnection.disconnect();
      return;
    }
    emitProgress(io, processId, refreshedProcess);

    const retrievedDatasets = await paginationFunction(
      sqlConnection,
      offset,
      limit,
      ...paginationFunctionParams
    );

    const transormedDatasets = await transformDatasets(
      impt,
      process,
      retrievedDatasets,
      idColumn
    );

    await transferDatasets(transormedDatasets);

    await ImportProcessesRepository.update(process._id, {
      attempts: 0,
      errorMessage: null,
      $inc: {
        processedDatasetsCount: retrievedDatasets.length,
        transferedDatasetsCount: transormedDatasets.length
      }
    });

    offset += limit;
  }

  const completedProcess = await ImportProcessesRepository.update(process._id, {
    status: ImportStatus.COMPLETED,
    errorMessage: null
  });
  emitProgress(io, processId, completedProcess);
}
