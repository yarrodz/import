import ImportProcess from '../../import-processes/import-process.schema';
import { IImportProcessModel } from '../../import-processes/import-process.schema';
import { IImportModel } from '../import.schema';
import { chunkArray } from '../helpers/chunk-array';
import { transformDatasets } from '../helpers/transform-datasets';
import { transferDatasets } from '../helpers/transfer-datasets';
import { ImportStatus } from '../../import-processes/enums/import-status.enum';
import { ImapConnection } from '../../../utils/imap/imap.connection';
import { parseEmails } from '../helpers/parse-emails';

// To avoid ssl sertificate requirement for imap, will be removed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const LIMIT = 50;

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

    await importProcess.updateOne({
      datasetsCount: parseEmails.length
    });

    const { processedDatasetsCount } = importProcess;
    parsedEmails = parsedEmails.slice(
      processedDatasetsCount,
      parsedEmails.length
    );

    const chunkedEmails = JSON.parse(
      JSON.stringify(chunkArray(parsedEmails, LIMIT))
    ) as object[][];
    parsedEmails = null;

    while (chunkedEmails.length) {
      let reloadedImportProcess = await ImportProcess.findById(
        importProcess._id
      );
      if (reloadedImportProcess.status === ImportStatus.PAUSED) {
        return;
      }
      const chunk = chunkedEmails.shift();
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

    imapConnection.disconnect();
    await importProcess.updateOne({
      status: ImportStatus.COMPLETED
    });
  } catch (error) {
    imapConnection.disconnect();
    throw error;
  }
}
