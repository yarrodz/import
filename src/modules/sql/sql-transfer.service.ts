import { TransfersRepository } from '../transfers/transfers.repository';
import { SqlImportHelper } from './helpers/sql-import.helper';
import { ResponseHandler } from '../../utils/response-handler/response-handler';
import { Transfer } from '../transfers/interfaces/transfer.interface';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import { SqlImport } from './interfaces/sql-import.interface';

export class SqlTransferService {
  private sqlImportHelper: SqlImportHelper;

  constructor(sqlImportHelper: SqlImportHelper) {
    this.sqlImportHelper = sqlImportHelper;
  }

  async reload(impt: SqlImport, transfer: Transfer): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      this.sqlImportHelper.import({
        import: impt,
        transfer
      });
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async restart(impt: SqlImport, transfer: Transfer): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      // const retriedTransfer = await this.transfersRepository.update({
      //   id: transferId,
      //   status: TransferStatus.PENDING,
      //   retryAttempts: 0
      // });

      this.sqlImportHelper.import({
        import: impt,
        transfer: transfer
      });
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}
