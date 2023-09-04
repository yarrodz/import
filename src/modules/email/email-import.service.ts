import ResponseHandler from '../../utils/response-handler/response-handler';
import EmailColumnsHelper from './helpers/email-columns.helper';
import EmailImportHelper from './helpers/email-import.helper';
import EmailImport from './interfaces/email-import.interace';
import ProcessesRepository from '../processes/process.repository';
import EmailTransferHelper from './helpers/email-transfer-helper';
import { CreateEmailImportValidator } from './validators/create-email-import.validator';
import EmailConnection from './interfaces/email-connection.interface';
import { UpdateEmailImportValidator } from './validators/update-email-import.validator';

class EmailImportService {
  private emailColumnsHelper: EmailColumnsHelper;
  private emailImportHelper: EmailImportHelper;
  private emailTransferHelper: EmailTransferHelper;
  private processesRepository: ProcessesRepository;

  constructor(
    emailColumnsHelper: EmailColumnsHelper,
    emailImportHelper: EmailImportHelper,
    emailTransferHelper: EmailTransferHelper,
    processesRepository: ProcessesRepository
  ) {
    this.emailColumnsHelper = emailColumnsHelper;
    this.emailImportHelper = emailImportHelper;
    this.emailTransferHelper = emailTransferHelper;
    this.processesRepository = processesRepository;
  }

  async create(input: any, getColumns: boolean): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateEmailImportValidator.validate(input);
      if (error) {
        return responseHandler.setError(400, error);
      }

      const impt = await this.processesRepository.create(input);

      if (getColumns === false) {
        return responseHandler.setSuccess(200, {
          import: impt
        });
      } else {
        const { target } = input;
        const columns = this.emailColumnsHelper.get(target);

        return responseHandler.setSuccess(200, {
          import: impt,
          columns
        });
      }
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async update(
    input: any,
    getColumns: boolean,
    start: boolean
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = UpdateEmailImportValidator.validate(input);
      if (error) {
        return responseHandler.setError(400, error);
      }

      const { id } = input;

      const impt = await this.processesRepository.load(id);
      if (impt === undefined) {
        return responseHandler.setError(404, 'Import not found');
      }

      const updatedImport = await this.processesRepository.update(input);

      if (getColumns === true) {
        const { target } = input;
        const columns = this.emailColumnsHelper.get(target);

        return responseHandler.setSuccess(200, {
          import: updatedImport,
          columns
        });
      } else if (start === true) {
        return this.startImport(updatedImport);
      } else {
        return responseHandler.setSuccess(200, {
          import: updatedImport
        });
      }
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async getColumns(impt: EmailImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { target } = impt;
      const columns = this.emailColumnsHelper.get(target);
      responseHandler.setSuccess(200, columns);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async checkImport(
    connection: EmailConnection,
    impt: any
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const error =
        CreateEmailImportValidator.validate(impt).error ||
        UpdateEmailImportValidator.validate(impt).error;

      if (error) {
        return responseHandler.setError(400, error);
      }
      await this.emailImportHelper.checkImport(connection, impt);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async startImport(impt: EmailImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const transfer = await this.emailTransferHelper.createStartedTransfer(
        impt
      );

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
}

export default EmailImportService;
