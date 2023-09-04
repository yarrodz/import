import SqlImportHelper from '../../sql/helpers/sql-import.helper';
import ApiImportHelper from '../../api/helpers/api-import.helper';
import TransfersRepository from '../transfers.repository';
import { Source } from '../../imports/enums/source.enum';
import { TransferStatus } from '../enums/transfer-status.enum';
import EmailImportHelper from '../../email/helpers/email-import.helper';

class PendingTransfersReloader {
  private sqlImportHelper: SqlImportHelper;
  private apiImportHelper: ApiImportHelper;
  private emailImportHelper: EmailImportHelper;
  private transfersRepository: TransfersRepository;

  constructor(
    sqlImportHelper: SqlImportHelper,
    apiImportHelper: ApiImportHelper,
    emailImportHelper: EmailImportHelper,
    transfersRepository: TransfersRepository
  ) {
    this.sqlImportHelper = sqlImportHelper;
    this.apiImportHelper = apiImportHelper;
    this.emailImportHelper = emailImportHelper;
    this.transfersRepository = transfersRepository;
  }

  async reload() {
    const pendingTransfers = await this.transfersRepository.query(
      {
        type: 'equals',
        property: 'status',
        value: TransferStatus.PENDING
      },
      {},
      false
    );

    await Promise.all(
      pendingTransfers.map(async (transfer) => {
        try {
          const impt = transfer.__.inImport;

          const { source } = impt;

          switch (source) {
            case Source.SQL: {
              await this.sqlImportHelper.import({
                import: impt,
                transfer
              });
              break;
            }
            case Source.API: {
              await this.apiImportHelper.import({
                import: impt,
                transfer
              });
              break;
            }
            case Source.EMAIL: {
              await this.emailImportHelper.import({
                import: impt,
                transfer
              });
              break;
            }
            default: {
              console.error(
                `Error while reloading pending transfers: Unknown import source: '${source}'.`
              );
            }
          }
        } catch (error) {
          console.error(`Error while reloading pending transfers: ${error}.`);
        }
      })
    );
  }
}

export default PendingTransfersReloader;
