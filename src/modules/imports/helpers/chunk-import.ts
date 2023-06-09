import ImportProcess from '../../import-processes/import-process.schema';
import { IImportModel } from '../import.schema';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import { transformDatasets } from './transform-datasets';
import { transferDatasets } from './transfer-datasets';

export async function chunkImport(
  chunkedDatasets: object[][],
  imp: IImportModel,
  importProcess: IImportProcessModel,
  idColumn: string
) {
  while (chunkedDatasets.length) {
    let reloadedImportProcess = await ImportProcess.findById(importProcess._id);
    if (reloadedImportProcess.status === ImportStatus.PAUSED) {
      return;
    }

    const chunk = chunkedDatasets.shift();
    console.log(chunk.length);
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
  await importProcess.updateOne({
    status: ImportStatus.COMPLETED,
    errorMessage: null
  });
}
