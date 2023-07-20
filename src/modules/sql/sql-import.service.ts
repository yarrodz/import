import SqlColumnsHelper from './sql-columns.helper';
import SqlTransferHelper from './sql-transfer.helper';
import ResponseHandler from '../../utils/response-handler/response-handler';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { IImportDocument } from '../imports/import.schema';
import { ImportStatus } from '../import-processes/enums/import-status.enum';

class SqlImportService {
  private sqlColumnsHelper: SqlColumnsHelper;
  private sqlTransferHelper: SqlTransferHelper;
  private importProcessesRepository: ImportProcessesRepository;

  constructor(
    sqlColumnsHelper: SqlColumnsHelper,
    sqlTransferHelper: SqlTransferHelper,
    importProcessesRepository: ImportProcessesRepository
  ) {
    this.sqlColumnsHelper = sqlColumnsHelper;
    this.sqlTransferHelper = sqlTransferHelper;
    this.importProcessesRepository = importProcessesRepository;
  }

  async connect(impt: IImportDocument): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;

      const idColumnUnique =
        await this.sqlColumnsHelper.checkIdColumnUniqueness(impt);
      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

      const columns = await this.sqlColumnsHelper.find(impt);

      responseHandler.setSuccess(200, {
        importId,
        columns
      });
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async start(impt: IImportDocument): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;

      const process = await this.importProcessesRepository.create({
        unit: impt.unit as string,
        import: importId
      });
      const { _id: processId } = process;

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.sqlTransferHelper.transfer(impt, process);
      responseHandler.setSuccess(200, processId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;
      const { _id: processId } = process;

      await this.importProcessesRepository.update(processId, {
        status: ImportStatus.PENDING
      });

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.sqlTransferHelper.transfer(impt, process);
      responseHandler.setSuccess(200, processId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;
      const { _id: processId } = process;

      await this.importProcessesRepository.update(processId, {
        attempts: 0,
        status: ImportStatus.PENDING,
        errorMessage: null
      });

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.sqlTransferHelper.transfer(impt, process);
      responseHandler.setSuccess(200, processId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default SqlImportService;
