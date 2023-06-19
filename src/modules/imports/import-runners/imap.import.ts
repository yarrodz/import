import { ImapConnection } from '../../../utils/imap/imap.connection';
import { parseEmails } from '../helpers/parse-emails';
import { chunkArray } from '../helpers/chunk-array';
import { chunkImport } from '../helpers/chunk-import';
import { IImportDocument } from '../import.schema';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import ImportProcessesRepository from '../../import-processes/import-processes.repository';

// To avoid ssl sertificate requirement for imap, will be removed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const CHUNK_SIZE = 50;

export async function imapImport(
  impt: IImportDocument,
  process: IImportProcessDocument
) {
  let imapConnection: ImapConnection;
  try {
    const idColumn = 'messageId';
    const connection = impt.imap.connection;

    imapConnection = new ImapConnection(connection);
    await imapConnection.connect();
    const rawEmails = await imapConnection.receiveEmails();
    let parsedEmails = await parseEmails(rawEmails);
    imapConnection.disconnect();

    await ImportProcessesRepository.update(process._id, {
      datasetsCount: parsedEmails.length
    });

    const { processedDatasetsCount } = process;
    let emailesToImport = parsedEmails.slice(
      processedDatasetsCount,
      parsedEmails.length
    );

    const chunkedEmails = JSON.parse(
      JSON.stringify(chunkArray(emailesToImport, CHUNK_SIZE))
    ) as object[][];
    parsedEmails = null;
    emailesToImport = null;

    await chunkImport(chunkedEmails, impt, process, idColumn);
  } catch (error) {
    imapConnection.disconnect();
    throw error;
  }
}
