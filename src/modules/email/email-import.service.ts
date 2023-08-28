import TransfersRepository from '../transfers/transfers.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { TransferType } from '../transfers/enums/transfer-type.enum';
import { TransferMethod } from '../transfers/enums/transfer-method.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import EmailColumnsHelper from './helpers/email-columns.helper';
import EmailImportHelper from './helpers/email-import.helper';
import EmailImport from './interfaces/email-import.interace';
import { EmailOptions } from 'joi';
import ProcessesRepository from '../processes/process.repository';

class EmailImportService {
  private emailColumnsHelper: EmailColumnsHelper;
  private emailImportHelper: EmailImportHelper;
  private processesRepository: ProcessesRepository;
  private transfersRepository: TransfersRepository;

  constructor(
    emailColumnsHelper: EmailColumnsHelper,
    emailImportHelper: EmailImportHelper,
    processesRepository: ProcessesRepository,
    transefersRepository: TransfersRepository
  ) {
    this.emailColumnsHelper = emailColumnsHelper;
    this.emailImportHelper = emailImportHelper;
    this.processesRepository = processesRepository;
    this.transfersRepository = transefersRepository;
  }

  async create(input: any, getColumns: boolean) {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.create(input);

      if (getColumns === false) {
        responseHandler.setSuccess(200, {
          import: impt
        });
        return responseHandler;
      }
      else {
        const columns = this.emailColumnsHelper.find();
        responseHandler.setSuccess(200, {
          import: impt,
          columns
        });
        return responseHandler;
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(input: any, getColumns: boolean, start: boolean) {
    const responseHandler = new ResponseHandler();
    try {
      const { id } = input;

      const impt = await this.processesRepository.load(id);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const updatedImport = await this.processesRepository.update(input);

      if (getColumns === true) {
        const columns = this.emailColumnsHelper.find();
        responseHandler.setSuccess(200, {
          import: updatedImport,
          columns
        });
        return responseHandler;
      }
      
      else if (start === true) {
        return this.import(updatedImport);
      }
      
      else {
        responseHandler.setSuccess(200, {
          import: updatedImport
        });
        return responseHandler;
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async getColumns(impt: EmailImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const columns = this.emailColumnsHelper.find();
      responseHandler.setSuccess(200, columns);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async checkIdColumnUniqueness(impt: EmailOptions): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const idColumnUnique =
        this.emailColumnsHelper.checkIdColumnUniqueness();
      responseHandler.setSuccess(200, idColumnUnique);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(impt: EmailImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const unit = impt.__.inUnit;
      const { id: unitId } = unit;

      const transfer = await this.transfersRepository.create({
        type: TransferType.IMPORT,
        method: TransferMethod.OFFSET_PAGINATION,
        status: TransferStatus.PENDING,
        offset: 1,
        transferedDatasetsCount: 0,
        log: [],
        retryAttempts: 0,
        __: {
          inImport: {
            id: importId,
            _d: 'out'
          },
          inUnit: {
            id: unitId,
            _d: 'out'
          }
        }
      });

      await this.emailImportHelper.import({
        import:  impt,
        transfer  
      });

      const { id: transferId } = transfer;
      responseHandler.setSuccess(200, transferId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default EmailImportService;
