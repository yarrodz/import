import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import { IImportProcessDocument } from '../modules/import-processes/import-process.schema';
import { IImportDocument } from '../modules/imports/import.schema';
import { ImportStatus } from '../modules/import-processes/enums/import-status.enum';
import { transformDatasets } from './transform-datasets';
import { transferDatasets } from './transfer-datasets';
import Websocket from '../utils/websocket/websocket';
import emitProgress from './emit-progress';

export async function chunkImport(
  chunkedDatasets: object[][],
  impt: IImportDocument,
  process: IImportProcessDocument,
  idColumn: string
) {
  const io = Websocket.getInstance();
  const unit = impt.unit as string;
  while (chunkedDatasets.length) {
    const refreshedProcess = await ImportProcessesRepository.findById(
      process._id
    );
    if (refreshedProcess.status === ImportStatus.PAUSED) {
      return;
    }
    emitProgress(io, unit, refreshedProcess);

    const chunk = chunkedDatasets.shift();
    const transormedDatasets = await transformDatasets(
      impt,
      process,
      chunk,
      idColumn
    );

    await transferDatasets(transormedDatasets);

    await ImportProcessesRepository.update(process._id, {
      attempts: 0,
      errorMessage: null,
      processedDatasetsCount:
        refreshedProcess.processedDatasetsCount + chunk.length,
      transferedDatasetsCount:
        refreshedProcess.processedDatasetsCount + transormedDatasets.length
    });
  }

  const completedProcess = await ImportProcessesRepository.update(process._id, {
    status: ImportStatus.COMPLETED,
    errorMessage: null
  });
  emitProgress(io, unit, completedProcess);
}
