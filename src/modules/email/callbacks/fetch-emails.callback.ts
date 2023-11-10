import { OffsetPagination } from "../../transfer-processes/interfaces/offset-pagination.interface";
import { ImapConnector } from "../connectors/imap.connector";
import { EmailUidRangeHelper } from "../helpers/email-uid-range.helper";
import { FetchDatasetsCallback } from "../../transfer-processes/interfaces/callbacks/fetch-datasets-callback.interface";
import { TransferProcess } from "../../transfer-processes/interfaces/transfer-process.interface";

export function fetchEmailsFunction(
  process: TransferProcess,
  imapConnector: ImapConnector,
): FetchDatasetsCallback {
  const { uids } = process.helper;
  return async function (pagination: OffsetPagination) {
    const range = EmailUidRangeHelper.createArrayRange(
      pagination,
      uids
    );

    const emails = await imapConnector.fetchEmails(range);

    return { datasets: emails };
  };
}