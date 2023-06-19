import ImportProcessesRepository from '../../import-processes/import-processes.repository';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import Websocket from '../../../utils/websocket/websocket';
import emitProgress from './emit-progress';
import { IPaginationFunction } from '../intefaces/pagination-function.interface';
import { transformDatasets } from './transform-datasets';
import { transferDatasets } from './transfer-datasets';
import { IImportDocument } from '../import.schema';

export async function paginationImport(
  impt: IImportDocument,
  process: IImportProcessDocument,
  idColumn: string,
  datasetsCount: number,
  offset: number,
  limit: number,
  paginationFunction: IPaginationFunction,
  ...paginationFunctionParams: any[]
) {
  const io = Websocket.getInstance();
  const processId = process._id as string;
  while (offset < datasetsCount) {
    const refreshedProcess = await ImportProcessesRepository.findById(
      process._id
    );
    if (refreshedProcess.status === ImportStatus.PAUSED) {
      return;
    }
    emitProgress(io, processId, refreshedProcess);

    const retrievedDatasets = await paginationFunction(
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

    await transferDatasets(impt._id, transormedDatasets);

    await ImportProcessesRepository.update(process._id, {
      attempts: 0,
      errorMessage: null,
      processedDatasetsCount:
        refreshedProcess.processedDatasetsCount + retrievedDatasets.length,
      transferedDatasetsCount:
        refreshedProcess.processedDatasetsCount + transormedDatasets.length
    });

    offset += limit;
  }

  const completedProcess = await ImportProcessesRepository.update(process._id, {
    status: ImportStatus.COMPLETED,
    errorMessage: null
  });
  emitProgress(io, processId, completedProcess);
}
