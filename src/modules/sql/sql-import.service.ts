import { TransfersRepository } from '../transfers/transfers.repository';
import { SqlColumnsHelper } from './helpers/sql-columns.helper';
import { SqlImportHelper } from './helpers/sql-import.helper';
import { SqlImport } from './interfaces/sql-import.interface';
import { ResponseHandler } from '../../utils/response-handler/response-handler';
import { TransferType } from '../transfers/enums/transfer-type.enum';
import { TransferMethod } from '../transfers/enums/transfer-method.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import { ProcessesRepository } from '../processes/process.repository';
import { CreateSqlImportValidator } from './validators/create-sql-import.validator';
import { UpdateSqlImportValidator } from './validators/update-sql-import.validator';
import { SqlTransferHelper } from './helpers/sql-transfer.helper';
import { SqlConnection } from './interfaces/sql.connection.interface';
import { Transfer } from '../transfers/interfaces/transfer.interface';

export class SqlImportService {
  private sqlColumnsHelper: SqlColumnsHelper;
  private sqlImportHelper: SqlImportHelper;
  private sqlTransferHelper: SqlTransferHelper;
  private processesRepository: ProcessesRepository;

  constructor(
    sqlColumnsHelper: SqlColumnsHelper,
    sqlImportHelper: SqlImportHelper,
    sqlTransferHelper: SqlTransferHelper,
    processesRepository: ProcessesRepository
  ) {
    this.sqlColumnsHelper = sqlColumnsHelper;
    this.sqlImportHelper = sqlImportHelper;
    this.sqlTransferHelper = sqlTransferHelper;
    this.processesRepository = processesRepository;
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
        return responseHandler.setSuccess(200, {
          import: impt
        });
      } else {
        const columns = await this.sqlColumnsHelper.find(impt);
        return responseHandler.setSuccess(200, {
          import: impt,
          columns
        });
      }
    } catch (error) {
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

  async checkImport(
    connection: SqlConnection,
    impt: any
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const error =
        CreateSqlImportValidator.validate(impt).error ||
        UpdateSqlImportValidator.validate(impt).error;
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      await this.sqlImportHelper.checkImport(connection, impt);

      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async startImport(
    impt: SqlImport,
    transfer?: Transfer
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      if (transfer === undefined) {
        transfer = await this.sqlTransferHelper.createTransfer(impt);
      }
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
}
