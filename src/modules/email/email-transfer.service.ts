import TransfersRepository from '../transfers/transfers.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import Transfer from '../transfers/interfaces/transfer.interface';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import EmailImportHelper from './helpers/email-import.helper';
import EmailImport from './interfaces/email-import.interace';

class EmailTransferService {
  private emailImportHelper: EmailImportHelper;
  private transfersRepository: TransfersRepository;

  constructor(
    emailImportHelper: EmailImportHelper,
    transfersRepository: TransfersRepository
  ) {
    this.emailImportHelper = emailImportHelper;
    this.transfersRepository = transfersRepository;
  }

  async reload(impt: EmailImport, transfer: Transfer): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      const reloadedTransfer = await this.transfersRepository.update({
        id: transferId,
        status: TransferStatus.PENDING
      });

      this.emailImportHelper.import({
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

  async retry(impt: EmailImport, transfer: Transfer): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      const retriedTransfer = await this.transfersRepository.update({
        id: transferId,
        status: TransferStatus.PENDING,
        retryAttempts: 0
      });

      this.emailImportHelper.import({
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

export default EmailTransferService;
