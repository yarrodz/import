import SqlTransferHelper from '../../sql/helpers/sql-import.helper';
import ApiTransferHelper from '../../api/helpers/api-import.helper';
import TransfersRepository from '../transfers.repository';
import ProcessesRepository from '../../processes/process.repository';
import { Source } from '../../imports/enums/source.enum';
import { TransferStatus } from '../enums/transfer-status.enum';

class PendingTransfersReloader {
  sqlTransferHelper: SqlTransferHelper;
  apiTransferHelper: ApiTransferHelper;
  transfersRepository: TransfersRepository;
  processesRepository: ProcessesRepository;

  constructor(
    sqlTransferHelper: SqlTransferHelper,
    apiTransferHelper: ApiTransferHelper,
    transfersRepository: TransfersRepository,
    processesRepository: ProcessesRepository
  ) {
    this.sqlTransferHelper = sqlTransferHelper;
    this.apiTransferHelper = apiTransferHelper;
    this.transfersRepository = transfersRepository;
    this.processesRepository = processesRepository;
  }

  async reload() {
    // const pendingTransfers = await this.transfersRepository.getAll({
    //   status: TransferStatus.PENDING
    // });
    const pendingTransfers = [];

    await Promise.all(
      pendingTransfers.map(async (transfer) => {
        try {
          const impt = transfer.__.inImport[0];

          const { source } = impt;

          switch (source) {
            case Source.SQL: {
              await this.sqlTransferHelper.import({
                import: impt,
                transfer
              });
              break;
            }
            case Source.API: {
              await this.apiTransferHelper.import({
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
