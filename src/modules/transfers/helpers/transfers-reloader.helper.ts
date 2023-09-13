import { SqlImportHelper } from '../../sql/helpers/sql-import.helper';
import { ApiImportHelper } from '../../api/helpers/api-import.helper';
import { EmailImportHelper } from '../../email/helpers/email-import.helper';
import { TransfersRepository } from '../transfers.repository';
import { Source } from '../../imports/enums/source.enum';
import { TransferState } from '../enums/transfer-state.enum';
import { ProcessesRepository } from '../../processes/process.repository';

export class PendingTransfersReloader {
  private sqlImportHelper: SqlImportHelper;
  private apiImportHelper: ApiImportHelper;
  private emailImportHelper: EmailImportHelper;
  private transfersRepository: TransfersRepository;
  private processesRepository: ProcessesRepository;

  constructor(
    sqlImportHelper: SqlImportHelper,
    apiImportHelper: ApiImportHelper,
    emailImportHelper: EmailImportHelper,
    transfersRepository: TransfersRepository,
    processesRepository: ProcessesRepository
  ) {
    this.sqlImportHelper = sqlImportHelper;
    this.apiImportHelper = apiImportHelper;
    this.emailImportHelper = emailImportHelper;
    this.transfersRepository = transfersRepository;
    this.processesRepository = processesRepository;
  }

  async reload() {
    const pendingTransfers = await this.transfersRepository.query(
      {
        type: 'equals',
        property: 'status',
        value: TransferState.PENDING
      },
      {},
      false
    );

    await Promise.all(
      pendingTransfers.map(async (transfer) => {
        try {
          const loadedTransfer = await this.transfersRepository.load(
            transfer.id
          );

          const importId = loadedTransfer.__.inImport.id;
          const impt = await this.processesRepository.load(importId);

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
