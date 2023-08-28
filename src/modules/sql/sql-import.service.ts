import TransfersRepository from '../transfers/transfers.repository';
import SqlColumnsHelper from './helpers/sql-columns.helper';
import SqlImportHelper from './helpers/sql-import.helper';
import SqlImport from './interfaces/sql-import.interface';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { TransferType } from '../transfers/enums/transfer-type.enum';
import { TransferMethod } from '../transfers/enums/transfer-method.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import ProcessesRepository from '../processes/process.repository';
import { CreateSqlImportValidator } from './validators/create-sql-import.validator';
import { UpdateSqlImportValidator } from './validators/update-sql-import.validator';

class SqlImportService {
  private sqlColumnsHelper: SqlColumnsHelper;
  private sqlImportHelper: SqlImportHelper;
  private processesRepository: ProcessesRepository;
  private transfersRepository: TransfersRepository;

  constructor(
    sqlColumnsHelper: SqlColumnsHelper,
    sqlImportHelper: SqlImportHelper,
    processesRepository: ProcessesRepository,
    transefersRepository: TransfersRepository
  ) {
    this.sqlColumnsHelper = sqlColumnsHelper;
    this.sqlImportHelper = sqlImportHelper;
    this.processesRepository = processesRepository;
    this.transfersRepository = transefersRepository;
  }

  async create(input: any, getColumns: boolean) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateSqlImportValidator.validate(input);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }


      ////TO DO FIX
      let impt = await this.processesRepository.create(input);
      impt = await this.processesRepository.load(impt.id);

      if (getColumns === false) {
        responseHandler.setSuccess(200, {
          import: impt
        });
        return responseHandler;
      } else {
        const columns = await this.sqlColumnsHelper.find(impt);
        responseHandler.setSuccess(200, {
          import: impt,
          columns
        });
        return responseHandler;
      }
    } catch (error) {
      console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(input: any, getColumns: boolean, start: boolean) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = UpdateSqlImportValidator.validate(input);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const { id } = input;

      const impt = await this.processesRepository.load(id);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const updatedImport = await this.processesRepository.update(input);

      if (getColumns === true) {
        const columns = await this.sqlColumnsHelper.find(impt);
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

  async getColumns(impt: SqlImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const columns = await this.sqlColumnsHelper.find(impt);

      responseHandler.setSuccess(200, columns);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async checkIdColumnUniqueness(impt: SqlImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const idColumnUnique =
        await this.sqlColumnsHelper.checkIdColumnUniqueness(impt);

      responseHandler.setSuccess(200, idColumnUnique);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(impt: SqlImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id: importId } = impt;
      const unit = impt.__.inUnit;
      const { id: unitId } = unit;

      const transfer = await this.transfersRepository.create({
        type: TransferType.IMPORT,
        method: TransferMethod.OFFSET_PAGINATION,
        status: TransferStatus.PENDING,
        offset: 0,
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

      this.sqlImportHelper.import({
        import: impt,
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

export default SqlImportService;
