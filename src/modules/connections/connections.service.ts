import ConnectionsRepository from './connections.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { Source } from '../imports/enums/source.enum';

class ConnectionsService {
  private connectionsRepository: ConnectionsRepository;

  constructor(connectionsRepository: ConnectionsRepository) {
    this.connectionsRepository = connectionsRepository;
  }

  async getAll(select: any, sortings: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const connections = await this.connectionsRepository.getAll(select, sortings);
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
      const connection = await this.connectionsRepository.get(id);
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
      // const { error } = SynchronizationValidator.validate(
      //   createSynchronizationInput
      // );
      // if (error) {
      //   responseHandler.setError(400, error);
      //   return responseHandler;
      // }
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
      // const { error } = SynchronizationValidator.validate(
      //   createSynchronizationInput
      // );
      // if (error) {
      //   responseHandler.setError(400, error);
      //   return responseHandler;
      // }

      const { id } = input;
      const connection = await this.connectionsRepository.get(id);
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
      const connection = await this.connectionsRepository.get(id);
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
