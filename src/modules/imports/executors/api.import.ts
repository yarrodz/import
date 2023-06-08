import axios from 'axios';

import ImportProcess from '../../import-processes/import-process.schema';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { IImportModel } from '../import.schema';
import { chunkArray } from '../helpers/chunk-array';
import { transformDatasets } from '../helpers/transform-datasets';
import { transferDatasets } from '../helpers/transfer-datasets';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import { resolvePath } from '../helpers/resolve-path';

const LIMIT = 50;

export async function apiImport(
  imp: IImportModel,
  importProcess: IImportProcessModel
) {
  const idColumn = imp.idColumn;
  const config = imp.api.config;
  const path = imp.api.path;

  const data = await axios(config);
  let retrievedDatasets = resolvePath(data, path) as object[];

  await importProcess.updateOne({
    datasetsCount: retrievedDatasets.length
  });

  const { processedDatasetsCount } = importProcess;
  retrievedDatasets = retrievedDatasets.slice(
    processedDatasetsCount,
    retrievedDatasets.length
  );

  let chunkedDatasets = JSON.parse(
    JSON.stringify(chunkArray(retrievedDatasets, LIMIT))
  ) as object[][];
  retrievedDatasets = null;

  while (chunkedDatasets.length) {
    let reloadedImportProcess = await ImportProcess.findById(importProcess._id);
    if (reloadedImportProcess.status === ImportStatus.PAUSED) {
      return;
    }

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
      $inc: {
        processedDatasetsCount: chunk.length,
        transferedDatasetsCount: transormedDatasets.length
      }
    });
  }
  await importProcess.updateOne({
    status: ImportStatus.COMPLETED
  });
}
