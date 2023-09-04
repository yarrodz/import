import ConnectionsRepository from './connections.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { Source } from '../imports/enums/source.enum';
import SqlConnectionService from '../sql/sql-connection.service';
import ApiConnectionService from '../api/api-conection.service';
import EmailConnectionService from '../email/email-connection.service';

class ConnectionsService {
  private sqlConnectionService: SqlConnectionService;
  private apiConnectionService: ApiConnectionService;
  private emailConnectionService: EmailConnectionService;
  private connectionsRepository: ConnectionsRepository;

  constructor(
    sqlConnectionService: SqlConnectionService,
    apiConnectionService: ApiConnectionService,
    emailConnectionService: EmailConnectionService,
    connectionsRepository: ConnectionsRepository
  ) {
    this.sqlConnectionService = sqlConnectionService;
    this.apiConnectionService = apiConnectionService;
    this.emailConnectionService = emailConnectionService;
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

  async create(connection: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { source } = connection;

      switch (source) {
        case Source.SQL: {
          return this.sqlConnectionService.create(connection);
        }
        case Source.API: {
          return this.apiConnectionService.create(connection);
          break;
        }
        case Source.EMAIL: {
          return this.emailConnectionService.create(connection);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating connection. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(connection: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { id, source } = connection;

      const existingConnection = await this.connectionsRepository.load(id);
      if (!existingConnection) {
        responseHandler.setError(404, 'Connection not found');
        return responseHandler;
      }

      switch (source) {
        case Source.SQL: {
          return this.sqlConnectionService.update(connection);
        }
        case Source.API: {
          return this.apiConnectionService.update(connection);
          break;
        }
        case Source.EMAIL: {
          return this.emailConnectionService.update(connection);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating connection. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
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

  async checkConnection(connection: any) {
    const responseHandler = new ResponseHandler();
    try {
      const { source } = connection;

      switch (source) {
        case Source.SQL: {
          return this.sqlConnectionService.checkConnection(connection);
        }
        case Source.API: {
          responseHandler.setError(400, 'Not implemented');
          return responseHandler;
        }
        case Source.EMAIL: {
          return this.emailConnectionService.checkConnection(connection);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while checking connection. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ConnectionsService;
