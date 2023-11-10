import { FetchDatasetsCallback } from "../../transfer-processes/interfaces/callbacks/fetch-datasets-callback.interface";
import { SqlConnector } from "../connectors/sql.connector";
import { OffsetPagination } from "../../transfer-processes/interfaces/offset-pagination.interface";
import { SelectQueryHelper } from "../helpers/select-query.helper";
import { SqlIframeTransfer } from "../interfaces/sql-iframe-transfer.interface";

export function selectFetch(
  transfer: SqlIframeTransfer,
  sqlConnector: SqlConnector,
): FetchDatasetsCallback {
  const { select, idKey } = transfer;
  return async function (pagination: OffsetPagination) {
    const paginatedQuery = SelectQueryHelper.paginateSelect(
      select,
      idKey,
      pagination
    );

    const datasets = await sqlConnector.queryRows(paginatedQuery);

    return { datasets };
  }
}