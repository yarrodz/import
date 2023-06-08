import ImportProcess from '../../import-processes/import-process.schema';
import {
  createSelectCountQuery,
  createSelectDataQuery
} from '../../../utils/postgres/postgres.query-builder';
import { PostgresConnection } from '../../../utils/postgres/postgres.connection';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { createRequestedFields } from '../helpers/create-requested-fields';
import { transferDatasets } from '../helpers/transfer-datasets';
import { transformDatasets } from '../helpers/transform-datasets';
import { IImportModel } from '../import.schema';

const LIMIT = 100;

export async function postgresImport(
  imp: IImportModel,
  importProcess: IImportProcessModel
) {
  const config = imp.database.config;
  const table = imp.database.table;
  const fields = imp.fields;
  const idColumn = imp.idColumn;
  const requestedFields = createRequestedFields(fields, idColumn);

  const postgresConnection = new PostgresConnection(config);
  await postgresConnection.checkConnection();
  const countQuery = createSelectCountQuery(table);
  const datasetsCount = await postgresConnection.queryCount(countQuery);
  await importProcess.updateOne({ datasetsCount });

  let offset = importProcess.processedDatasetsCount;
  for (; offset < datasetsCount; offset += LIMIT) {
    let reloadedImportProcess = await ImportProcess.findById(importProcess._id);
    if (reloadedImportProcess.status === ImportStatus.PAUSED) {
      return;
    }

    const rowsQuery = createSelectDataQuery(
      table,
      requestedFields,
      LIMIT,
      offset
    );

    const retrievedDatasets = await postgresConnection.queryRows(rowsQuery);

    const transormedDatasets = await transformDatasets(
      imp,
      importProcess,
      retrievedDatasets,
      idColumn
    );

    await transferDatasets(transormedDatasets);

    await importProcess.updateOne({
      attempts: 0,
      $inc: {
        processedDatasetsCount: retrievedDatasets.length,
        transferedDatasetsCount: transormedDatasets.length
      }
    });
  }

  await importProcess.updateOne({
    status: ImportStatus.COMPLETED
  });
}
