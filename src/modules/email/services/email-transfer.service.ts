import { TransfersRepository } from '../../transfer-processes/transfer-processes.repository';
import { ResponseHandler } from '../../../utils/response-handler/response-handler';
import { EmailImportHelper } from '../helpers/email-transfers.helper';
import { EmailImport } from '../interfaces/email-iframe-transfer.interace';
import { Transfer } from '../../transfer-processes/interfaces/transfer-process.interface';

export class EmailTransferService {
  private emailImportHelper: EmailImportHelper;

  constructor(emailImportHelper: EmailImportHelper) {
    this.emailImportHelper = emailImportHelper;
  }

  async reload(
    impt: EmailImport,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      this.emailImportHelper.import({
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

  async restart(
    impt: EmailImport,
    transfer: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: transferId } = transfer;

      this.emailImportHelper.import({
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
