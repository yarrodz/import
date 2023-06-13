import axios from 'axios';

import { IImportModel } from '../import.schema';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { resolvePath } from '../helpers/resolve-path';
import { chunkArray } from '../helpers/chunk-array';
import { chunkImport } from '../helpers/chunk-import';

const CHUNK_SIZE = 50;

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
  let datasetsToImport = retrievedDatasets.slice(
    processedDatasetsCount,
    retrievedDatasets.length
  );

  let chunkedDatasets = JSON.parse(
    JSON.stringify(chunkArray(datasetsToImport, CHUNK_SIZE))
  ) as object[][];
  retrievedDatasets = null;
  datasetsToImport = null;

  await chunkImport(chunkedDatasets, imp, importProcess, idColumn);
}
