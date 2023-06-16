import { IImportModel } from '../import.schema';
import ImportProcess, {
  IImportProcessModel
} from '../../import-processes/import-process.schema';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import Websocket from '../../../utils/websocket/websocket';
import emitProgress from './emit-progress';
import { IPaginationFunction } from '../intefaces/pagination-function.interface';
import { transformDatasets } from './transform-datasets';
import { transferDatasets } from './transfer-datasets';

export async function paginationImport(
  imp: IImportModel,
  importProcess: IImportProcessModel,
  idColumn: string,
  datasetsCount: number,
  offset: number,
  limit: number,
  paginationFunction: IPaginationFunction,
  ...paginationFunctionParams: any[]
) {
  const io = Websocket.getInstance();
  const processId = importProcess._id.toString();
  while (offset < datasetsCount) {
    const reloadedImportProcess = await ImportProcess.findById(
      importProcess._id
    );
    if (reloadedImportProcess.status === ImportStatus.PAUSED) {
      return;
    }
    emitProgress(io, processId, reloadedImportProcess);

    const retrievedDatasets = await paginationFunction(
      offset,
      limit,
      ...paginationFunctionParams
    );

    const transormedDatasets = await transformDatasets(
      imp,
      importProcess,
      retrievedDatasets,
      idColumn
    );

    await transferDatasets(transormedDatasets);

    await importProcess.updateOne({
      attempts: 0,
      errorMessage: null,
      $inc: {
        processedDatasetsCount: retrievedDatasets.length,
        transferedDatasetsCount: transormedDatasets.length
      }
    });
    offset += limit;
  }

  const completedProcess = await ImportProcess.findOneAndUpdate(
    importProcess._id,
    {
      status: ImportStatus.COMPLETED,
      errorMessage: null
    },
    { new: true }
  );
  emitProgress(io, processId, completedProcess);
}
