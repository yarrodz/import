import TransfersRepository from '../transfers/transfers.repository';
import SqlImportHelper from './helpers/sql-import.helper';
import ResponseHandler from '../../utils/response-handler/response-handler';
import Transfer from '../transfers/interfaces/transfer.interface';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import SqlImport from './interfaces/sql-import.interface';

class SqlTransferService {
  private sqlImportHelper: SqlImportHelper;
  private transfersRepository: TransfersRepository;

  constructor(sqlImportHelper: SqlImportHelper, transfersRepository: TransfersRepository) {
    this.sqlImportHelper = sqlImportHelper;
    this.transfersRepository = transfersRepository;
  }

  async reload(impt: SqlImport, transfer: Transfer): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      const reloadedTransfer = await this.transfersRepository.update({
        id: transferId,
        status: TransferStatus.PENDING
      });

      this.sqlImportHelper.import({
        import: impt,
        transfer: reloadedTransfer
      });
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(impt: SqlImport, transfer: Transfer): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      const retriedTransfer = await this.transfersRepository.update({
        id: transferId,
        status: TransferStatus.PENDING,
        retryAttempts: 0
      });

      this.sqlImportHelper.import({
        import: impt,
        transfer: retriedTransfer
      });
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default SqlTransferService;
