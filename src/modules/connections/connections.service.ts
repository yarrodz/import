import ConnectionsRepository from './connections.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { Source } from '../imports/enums/source.enum';
import { CreateSqlConnectionValidator } from '../sql/validators/create-sql-connection.validator';
import { CreateApiConnectionValidator } from '../api/validators/create-api-connection.validator';
import { UpdateSqlConnectionValidator } from '../sql/validators/update-sql-connection.validator';
import { UpdateApiConnectionValidator } from '../api/validators/update-api-connection.validator';

class ConnectionsService {
  private connectionsRepository: ConnectionsRepository;

  constructor(connectionsRepository: ConnectionsRepository) {
    this.connectionsRepository = connectionsRepository;
  }

  async getAll(select: any, sortings: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const connections = await this.connectionsRepository.query(
        select,
        sortings,
        false
      );
      responseHandler.setSuccess(200, connections);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async get(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const connection = await this.connectionsRepository.load(id);
      responseHandler.setSuccess(200, connection);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async create(input: any): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      const { source } = input;

      switch (source) {
        case Source.SQL: {
          const { error } = CreateSqlConnectionValidator.validate(input);
          if (error) {
            responseHandler.setError(400, error);
            return responseHandler;
          }
          break;
        }
        case Source.API: {
          const { error } = CreateApiConnectionValidator.validate(input);
          if (error) {
            responseHandler.setError(400, error);
            return responseHandler;
          }
          break;
        }
        case Source.EMAIL: {
          break;
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating import. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }

      const connection = await this.connectionsRepository.create(input);
      responseHandler.setSuccess(200, connection);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(input: any): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      const { source } = input;

      switch (source) {
        case Source.SQL: {
          const { error } = UpdateSqlConnectionValidator.validate(input);
          if (error) {
            responseHandler.setError(400, error);
            return responseHandler;
          }
          break;
        }
        case Source.API: {
          const { error } = UpdateApiConnectionValidator.validate(input);
          if (error) {
            responseHandler.setError(400, error);
            return responseHandler;
          }
          break;
        }
        case Source.EMAIL: {
          break;
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating import. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }

      const { id } = input;
      const connection = await this.connectionsRepository.load(id);
      if (!connection) {
        responseHandler.setError(404, 'Connection not found');
        return responseHandler;
      }

      const updatedConnection = await this.connectionsRepository.update(input);
      responseHandler.setSuccess(200, updatedConnection);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const connection = await this.connectionsRepository.load(id);
      if (!connection) {
        responseHandler.setError(404, 'Connection not found');
        return responseHandler;
      }
      await this.connectionsRepository.delete(id);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ConnectionsService;
