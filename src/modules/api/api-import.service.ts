import { Request } from 'express';

import ResponseHandler from '../../utils/response-handler/response-handler';
import ApiConnectionHelper from './api-connection.helper';
import ApiColumnsHelper from './api-columns.helper';
import ApiTransferHelper from './api-transfer.helper';
import OAuth2AuthUriHelper from '../oauth2/oauth2-auth-uri.helper';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { IImportDocument } from '../imports/import.schema';
import IImportContext from '../imports/interfaces/import-context.interface';
import { ImportContextAction } from '../imports/enums/import-context-action.enum';
import { ConnectionState } from '../connection/connection-state.enum';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import ImportsRepository from '../imports/imports.repository';

class ApiImportService {
  private apiConnectionHelper: ApiConnectionHelper;
  private apiColumnsHelper: ApiColumnsHelper;
  private apiTransferHelper: ApiTransferHelper;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;
  private importProcessesRepository: ImportProcessesRepository;
  private importsRepository: ImportsRepository;

  constructor(
    apiConnectionHelper: ApiConnectionHelper,
    apiColumnsHelper: ApiColumnsHelper,
    apiTransferHelper: ApiTransferHelper,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper,
    importProcessesRepository: ImportProcessesRepository,
    importsRepository: ImportsRepository
  ) {
    this.apiConnectionHelper = apiConnectionHelper;
    this.apiColumnsHelper = apiColumnsHelper;
    this.apiTransferHelper = apiTransferHelper;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
    this.importProcessesRepository = importProcessesRepository;
    this.importsRepository = importsRepository;
  }

  async connect(req: Request, impt: IImportDocument): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;

      const context: IImportContext = {
        action: ImportContextAction.CONNECT,
        importId
      };
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          impt,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.importsRepository.findById(importId);

      const idColumnUnique =
        await this.apiColumnsHelper.checkIdColumnUniqueness(updatedImport);
      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

      const columns = await this.apiColumnsHelper.find(updatedImport);

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

  async start(req: Request, impt: IImportDocument): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;

      const context: IImportContext = {
        action: ImportContextAction.START,
        importId
      };
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          impt,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.importsRepository.findById(importId);

      const process = await this.importProcessesRepository.create({
        unit: impt.unit as string,
        import: importId
      });
      const { _id: processId } = process;

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.apiTransferHelper.transfer(updatedImport, process);
      responseHandler.setSuccess(200, processId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(
    req: Request,
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;
      const { _id: processId } = process;

      const context: IImportContext = {
        action: ImportContextAction.RELOAD,
        importId,
        processId
      };
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          impt,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.importsRepository.findById(importId);

      await this.importProcessesRepository.update(processId, {
        status: ImportStatus.PENDING
      });

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.apiTransferHelper.transfer(updatedImport, process);
      responseHandler.setSuccess(200, processId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(
    req: Request,
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { _id: importId } = impt;
      const { _id: processId } = process;

      const context: IImportContext = {
        action: ImportContextAction.RELOAD,
        importId,
        processId
      };
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          impt,
          context
        );
        responseHandler.setSuccess(201, oAuth2AuthUri);
        return responseHandler;
      }

      const updatedImport = await this.importsRepository.findById(importId);

      await this.importProcessesRepository.update(processId, {
        attempts: 0,
        status: ImportStatus.PENDING,
        errorMessage: null
      });

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.apiTransferHelper.transfer(updatedImport, process);
      responseHandler.setSuccess(200, processId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ApiImportService;
