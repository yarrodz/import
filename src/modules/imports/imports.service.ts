import { Request } from 'express';

import ImportsRepository from './imports.repository';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import ConnectionService from '../connection/connection.service';
import ColumnsService from '../columns/columns.service';
import TransferService from '../transfer/transfer.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { FieldValidator } from './validators/field.validator';
import { ImportValidator } from './validators/import.validator';
import { IImport } from './import.schema';
import { IField } from './sub-schemas/field.schema';
import IImportContext from './interfaces/import-context.interface';
import { ImportContextAction } from './enums/import-context-action.enum';
import { ConnectionState } from '../connection/enums/connection-state.enum';
import OAuth2AuthUriHelper from '../oauth2/oauth2-auth-uri.helper';

class ImportsService {
  private importsRepository: ImportsRepository;
  private importProcessesRepository: ImportProcessesRepository;
  private connectionService: ConnectionService;
  private columnsService: ColumnsService;
  private transferService: TransferService;
  private oAuth2AuthUriHelper: OAuth2AuthUriHelper;

  constructor(
    importsRepository: ImportsRepository,
    importProcessesRepository: ImportProcessesRepository,
    connectionService: ConnectionService,
    columnsService: ColumnsService,
    transferService: TransferService,
    oAuth2AuthUriHelper: OAuth2AuthUriHelper
  ) {
    this.importsRepository = importsRepository;
    this.importProcessesRepository = importProcessesRepository;
    this.connectionService = connectionService;
    this.columnsService = columnsService;
    this.transferService = transferService;
    this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
  }

  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const imports = await this.importsRepository.findAll(unit);
      responseHandler.setSuccess(200, imports);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async create(
    req: Request,
    createImportInput: IImport
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = ImportValidator.validate(createImportInput);
      if (error) {
        console.log('errrr: ', error);
        responseHandler.setError(400, error);
        return responseHandler;
      }

      console.log('1');
      const impt = await this.importsRepository.create(createImportInput);
      const { _id: importId } = impt;
      console.log('2');

      const context: IImportContext = {
        action: ImportContextAction.CONNECT,
        importId
      };
      const connectionState = await this.connectionService.connect(importId);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = await this.oAuth2AuthUriHelper.createUri(
          req,
          impt,
          context
        );
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }
      console.log('3');

      const columns = await this.columnsService.find(importId);
      console.log('4');

      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        importId
      );
      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }
      console.log('5');

      responseHandler.setSuccess(200, {
        importId,
        columns
      });
      return responseHandler;
    } catch (error) {
      console.log('create Error: ', error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(
    req: Request,
    id: string,
    updateImportInput: IImport
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { error } = ImportValidator.validate(updateImportInput);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }
      await this.importsRepository.update(id, updateImportInput);

      const connectionState = await this.connectionService.connect(id);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const context: IImportContext = {
          action: ImportContextAction.CONNECT,
          importId: id
        };

        const authUri = await this.oAuth2AuthUriHelper.createUri(req, impt, context);
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }

      const columns = await this.columnsService.find(id);
      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        id
      );

      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

      responseHandler.setSuccess(200, {
        importId: id,
        columns
      });
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }
      await this.importsRepository.delete(id);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async connect(req: Request, id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const context: IImportContext = {
        action: ImportContextAction.CONNECT,
        importId: id
      };
      const connectionState = await this.connectionService.connect(id);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = await this.oAuth2AuthUriHelper.createUri(req, impt, context);
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }

      const columns = await this.columnsService.find(id);

      // const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
      //   importId
      // );

      // if (!idColumnUnique) {
      //   responseHandler.setError(
      //     409,
      //     'Provided id column includes duplicate values'
      //   );
      //   return responseHandler;
      // }

      responseHandler.setSuccess(200, {
        importId: id,
        columns
      });
      return responseHandler;
    } catch (error) {
      console.log('connect Error: ', error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async setFields(id: string, fieldInputs: IField[]): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const errorsArray = fieldInputs.map((fieldInput) => {
        const { error } = FieldValidator.validate(fieldInput);
        return error;
      });
      for (let error of errorsArray) {
        if (error) {
          responseHandler.setError(400, error);
          return responseHandler;
        }
      }

      const updatedImport = await this.importsRepository.update(id, {
        fields: fieldInputs
      });
      responseHandler.setSuccess(200, updatedImport);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async start(req: Request, id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const pendingImport =
        await this.importProcessesRepository.findPendingByUnit(
          impt.unit.toString()
        );
      if (pendingImport) {
        responseHandler.setError(
          409,
          'This unit is currently processing another import'
        );
        return responseHandler;
      }

      const context: IImportContext = {
        action: ImportContextAction.START,
        importId: id
      };
      const connectionState = await this.connectionService.connect(id);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = await this.oAuth2AuthUriHelper.createUri(req, impt, context);
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }

      const process = await this.importProcessesRepository.create({
        unit: impt.unit as string,
        import: id
      });
      const { _id: processId } = process;

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.transferService.transfer(id, processId);
      responseHandler.setSuccess(200, processId);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ImportsService;
