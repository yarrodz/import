import { ResponseHandler } from '../../utils/response-handler/response-handler';
import { EmailConnectionHelper } from './helpers/email-connection.helper';
import { ConnectionsRepository } from '../connections/connections.repository';
import { CreateEmailConnectionValidator } from './validators/create-email-connection.validator';
import { UpdateEmailConnectionValidator } from './validators/update-email-connection.validator';

export class EmailConnectionService {
  private emailConnectionHelper: EmailConnectionHelper;
  private connectionsRepository: ConnectionsRepository;

  constructor(
    emailConnectionHelper: EmailConnectionHelper,
    connectionsRepository: ConnectionsRepository
  ) {
    this.emailConnectionHelper = emailConnectionHelper;
    this.connectionsRepository = connectionsRepository;
  }

  async create(connection: any) {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateEmailConnectionValidator.validate(connection);
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
      const { error } = UpdateEmailConnectionValidator.validate(connection);
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
        CreateEmailConnectionValidator.validate(connection) ||
        UpdateEmailConnectionValidator.validate(connection);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      await this.emailConnectionHelper.checkConnection(connection);

      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}
