import ImportProcess from '../../import-processes/import-process.schema';
import { IImportModel } from '../import.schema';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import { transformDatasets } from './transform-datasets';
import { transferDatasets } from './transfer-datasets';
import Websocket from '../../../utils/websocket/websocket';
import emitProgress from './emit-progress';

export async function chunkImport(
  chunkedDatasets: object[][],
  imp: IImportModel,
  importProcess: IImportProcessModel,
  idColumn: string
) {
  const io = Websocket.getInstance();
  const unit = imp.unit.toString();
  while (chunkedDatasets.length) {
    const reloadedImportProcess = await ImportProcess.findById(
      importProcess._id
    );
    if (reloadedImportProcess.status === ImportStatus.PAUSED) {
      return;
    }
    emitProgress(io, unit, reloadedImportProcess);

    const chunk = chunkedDatasets.shift();
    const transormedDatasets = await transformDatasets(
      imp,
      importProcess,
      chunk,
      idColumn
    );

    await transferDatasets(transormedDatasets);

    await importProcess.updateOne({
      attempts: 0,
      errorMessage: null,
      $inc: {
        processedDatasetsCount: chunk.length,
        transferedDatasetsCount: transormedDatasets.length
      }
    });
  }

  const completedProcess = await ImportProcess.findOneAndUpdate(
    importProcess._id,
    {
      status: ImportStatus.COMPLETED,
      errorMessage: null
    },
    { new: true }
  );
  emitProgress(io, unit, completedProcess);
}
