import { FetchDatasetsCallback } from "../../transfer-processes/interfaces/callbacks/fetch-datasets-callback.interface";
import { SqlConnector } from "../connectors/sql.connector";
import { OffsetPagination } from "../../transfer-processes/interfaces/offset-pagination.interface";
import { TableQueryHelper } from "../helpers/table-query.helper";
import { SqlIframeTransfer } from "../interfaces/sql-iframe-transfer.interface";
import { RequestedFieldsHelper } from "../helpers/requested-fields.helper";

export function tableFetch(
  transfer: SqlIframeTransfer,
  sqlConnector: SqlConnector,
): FetchDatasetsCallback {
  const { table, idKey, fields } = transfer;
  const requestedFields = RequestedFieldsHelper.create(fields, idKey);
  return async function (pagination: OffsetPagination) {
    const rowsQuery = TableQueryHelper.createSelectQuery(
      table,
      idKey,
      pagination,
      requestedFields
    );

    const datasets = await sqlConnector.queryRows(rowsQuery);

    return { datasets };
  };
}