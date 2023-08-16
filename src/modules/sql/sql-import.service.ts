import TransfersRepository from '../transfers/transfers.repository';
import SqlColumnsHelper from './helpers/sql-columns.helper';
import SqlImportHelper from './helpers/sql-import.helper';
import SqlImport from './interfaces/sql-import.interface';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { TransferType } from '../transfers/enums/transfer-type.enum';
import { TransferMethod } from '../transfers/enums/transfer-method.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';

class SqlImportService {
  private sqlColumnsHelper: SqlColumnsHelper;
  private sqlImportHelper: SqlImportHelper;
  private transfersRepository: TransfersRepository;

  constructor(sqlColumnsHelper: SqlColumnsHelper, sqlImportHelper: SqlImportHelper, transefersRepository: TransfersRepository) {
    this.sqlColumnsHelper = sqlColumnsHelper;
    this.sqlImportHelper = sqlImportHelper;
    this.transfersRepository = transefersRepository;
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
      const unit = impt.__.inUnit[0];
      const { id: unitId } = unit;

      const transfer = await this.transfersRepository.create({
        type: TransferType.IMPORT,
        method: TransferMethod.OFFSET_PAGINATION,
        status: TransferStatus.PENDING,
        offset: 0,
        transferedDatasetsCount: 0,
        log: [],
        retryAttempts: 0,
        "__": {
          "inImport": {
            "id": importId,
            "_d": "out"
          },
          "inUnit": {
              "id": unitId,
              "_d": "out"
          }
        },
      });

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

export default SqlImportService;
