import { OffsetPagination } from "../../transfer-processes/interfaces/offset-pagination.interface";
import { ImapConnector } from "../connectors/imap.connector";
import { EmailSearchObjectHelper } from "../helpers/email-search-object.helper";
import { FetchDatasetsCallback } from "../../transfer-processes/interfaces/callbacks/fetch-datasets-callback.interface";
import { TransformEmailHelper } from "../helpers/transform-email.helper";
import { TransferProcess } from "../../transfer-processes/interfaces/transfer-process.interface";

export function fetchConversationsFunction(
  process: TransferProcess,
  imapConnector: ImapConnector,
): FetchDatasetsCallback {
  const { threadIds } = process.helper;
  return async function (pagination: OffsetPagination) {
    const { offset, limit } = pagination;
    const threadId = threadIds[offset + limit];

    const searchObject = EmailSearchObjectHelper.fromFilter({ threadId });
    const emails = await imapConnector.fetchEmailsAsync(searchObject);

    if (emails.length === 0) {
      return { datasets: [] };
    }

    const transformedEmails =
      await TransformEmailHelper.transformArray(emails);

    const { date } = transformedEmails[transformedEmails.length - 1];

    const converasation = {
      threadId,
      date,
      emails: transformedEmails,
    }

    return { datasets: [converasation] };
  }
}