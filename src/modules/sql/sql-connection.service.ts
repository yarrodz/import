import ResponseHandler from '../../utils/response-handler/response-handler';
import { CreateSqlConnectionValidator } from './validators/create-sql-connection.validator';
import ConnectionsRepository from '../connections/connections.repository';
import SqlConnectionHelper from './helpers/sql-connection.helper';
import { UpdateSqlConnectionValidator } from './validators/update-sql-connection.validator';

class SqlConnectionService {
  private sqlConnectionHelper: SqlConnectionHelper;
  private connectionsRepository: ConnectionsRepository;

  constructor(
    sqlConnectionHelper: SqlConnectionHelper,
    connectionsRepository: ConnectionsRepository
  ) {
    this.sqlConnectionHelper = sqlConnectionHelper;
    this.connectionsRepository = connectionsRepository;
  }

  async create(connection: any) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateSqlConnectionValidator.validate(connection);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const createdConnection = await this.connectionsRepository.create(
        connection
      );

      responseHandler.setSuccess(200, createdConnection);
      return responseHandler;
    } catch (error) {
      console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(connection: any) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = UpdateSqlConnectionValidator.validate(connection);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const updateConnection = await this.connectionsRepository.update(
        connection
      );

      responseHandler.setSuccess(200, updateConnection);
      return responseHandler;
    } catch (error) {
      console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async checkConnection(connection: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { error } =
        CreateSqlConnectionValidator.validate(connection) ||
        UpdateSqlConnectionValidator.validate(connection);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      await this.sqlConnectionHelper.checkConnection(connection);

      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default SqlConnectionService;
