import { ResponseHandler } from '../../utils/response-handler/response-handler';
import { ConnectionsRepository } from '../connections/connections.repository';
import { CreateApiConnectionValidator } from './validators/create-api-connection.validator';
import { UpdateApiConnectionValidator } from './validators/update-api-connection.validator';

export class ApiConnectionService {
  //   private apiConnectionHelper: apiConnectionHelper;
  private connectionsRepository: ConnectionsRepository;

  constructor(
    // apiConnectionHelper: apiConnectionHelper,
    connectionsRepository: ConnectionsRepository
  ) {
    // this.apiConnectionHelper = apiConnectionHelper;
    this.connectionsRepository = connectionsRepository;
  }

  async create(connection: any) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateApiConnectionValidator.validate(connection);
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
      // console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(connection: any) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = UpdateApiConnectionValidator.validate(connection);
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
      // console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  //   async checkConnection(connection: any): Promise<ResponseHandler> {
  //     const responseHandler = new ResponseHandler();
  //     try {
  //       const { error } =
  //         CreateApiConnectionValidator.validate(connection) ||
  //         UpdateApiConnectionValidator.validate(connection);
  //       if (error) {
  //         responseHandler.setError(400, error);
  //         return responseHandler;
  //       }

  //     //   await this.apiConnectionHelper.checkConnection(connection);

  //     //   responseHandler.setSuccess(200, true);
  //     //   return responseHandler;
  //     } catch (error) {
  //       responseHandler.setError(500, error.message);
  //       return responseHandler;
  //     }
  //   }
}
