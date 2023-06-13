import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { IImportModel } from '../import.schema';
import { ImapConnection } from '../../../utils/imap/imap.connection';
import { parseEmails } from '../helpers/parse-emails';
import { chunkArray } from '../helpers/chunk-array';
import { chunkImport } from '../helpers/chunk-import';

// To avoid ssl sertificate requirement for imap, will be removed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const CHUNK_SIZE = 50;

export async function imapImport(
  imp: IImportModel,
  importProcess: IImportProcessModel
) {
  let imapConnection: ImapConnection;
  try {
    const idColumn = 'messageId';
    const config = imp.imap.config;

    imapConnection = new ImapConnection(config);
    await imapConnection.connect();
    const rawEmails = await imapConnection.receiveEmails();
    let parsedEmails = await parseEmails(rawEmails);
    imapConnection.disconnect();

    await importProcess.updateOne({
      datasetsCount: parsedEmails.length
    });

    const { processedDatasetsCount } = importProcess;
    let emailesToImport = parsedEmails.slice(
      processedDatasetsCount,
      parsedEmails.length
    );

    const chunkedEmails = JSON.parse(
      JSON.stringify(chunkArray(emailesToImport, CHUNK_SIZE))
    ) as object[][];
    parsedEmails = null;
    emailesToImport = null;

    await chunkImport(chunkedEmails, imp, importProcess, idColumn);
  } catch (error) {
    imapConnection.disconnect();
    throw error;
  }
}
