import axios from 'axios';

import { IImportDocument } from '../modules/imports/import.schema';
import { IImportProcessDocument } from '../modules/import-processes/import-process.schema';
import { resolvePath } from '../helpers/resolve-path';
import { chunkArray } from '../helpers/chunk-array';
import { chunkImport } from '../helpers/chunk-import';
import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';

const CHUNK_SIZE = 50;

export async function apiImport(
  impt: IImportDocument,
  process: IImportProcessDocument
) {
  const requestConfig = impt.api.requestConfig;
  const idColumn = impt.api.idColumn;
  const path = impt.api.path;

  const data = await axios(requestConfig);
  let retrievedDatasets = resolvePath(data, path) as object[];

  await ImportProcessesRepository.update(process._id, {
    datasetsCount: retrievedDatasets.length
  });

  const { processedDatasetsCount } = process;
  let datasetsToImport = retrievedDatasets.slice(
    processedDatasetsCount,
    retrievedDatasets.length
  );

  let chunkedDatasets = JSON.parse(
    JSON.stringify(chunkArray(datasetsToImport, CHUNK_SIZE))
  ) as object[][];
  retrievedDatasets = null;
  datasetsToImport = null;

  await chunkImport(chunkedDatasets, impt, process, idColumn);
}
