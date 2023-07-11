import ImportsRepository from './imports.repository';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import TransferService from '../transfer/transfer.service';
import ColumnsService from '../columns/columns.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { FieldValidator } from './validators/field.validator';
import { CreateUpdateImportValidator } from './validators/create-update-import.validator';
import { IImport } from './import.schema';
import { IField } from './sub-schemas/field.schema';
import { RequestAuthType } from '../api/enums/request-auth-type.enum';
import { Request, Response } from 'express';
import OAuthService from '../oauth2/oauth2.service';
import OAuth2SessionHelper from '../oauth2/oauth2-session.helper';
import IOAuth2CallbackContext from '../oauth2/interafces/oauth2-callback-context.interface';
import { OAuth2CallbackContextAction } from '../oauth2/enums/oauth2-callback-context-action.enum';

class ImportsService {
  private importsRepository: ImportsRepository;
  private importProcessesRepository: ImportProcessesRepository;
  private columnsService: ColumnsService;
  private transferService: TransferService;
  private oAuthService: OAuthService;

  constructor(
    importsRepository: ImportsRepository,
    importProcessesRepository: ImportProcessesRepository,
    columnsService: ColumnsService,
    transferService: TransferService,
    oAuthService: OAuthService
  ) {
    this.importsRepository = importsRepository;
    this.importProcessesRepository = importProcessesRepository;
    this.columnsService = columnsService;
    this.transferService = transferService;
    this.oAuthService = oAuthService;
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
    const oAuthSessionHelper = new OAuth2SessionHelper(req.session);
    try {
      const { error } = CreateUpdateImportValidator.validate(createImportInput);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const impt = await this.importsRepository.create(createImportInput);

      let token;
      if (impt.api?.request?.auth?.type === RequestAuthType.OAUTH2) {
        const tokens = oAuthSessionHelper.findTokens(impt.id);
        if (tokens === null) {
          const oauth2 = impt.api?.request?.auth?.oauth2;
          const context: IOAuth2CallbackContext = {
            action: OAuth2CallbackContextAction.CONNECT,
            importId: impt.id
          } 
          return await this.oAuthService.oAuth2AuthUriRedirect(req, oauth2, context);
        }
      }
      const columns = await this.columnsService.find(createImportInput, token);

      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        createImportInput
      );
      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

      responseHandler.setSuccess(200, {
        importId: 'impt._id',
        columns
      });
      return responseHandler;
    } catch (error) {
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

      const { error } = CreateUpdateImportValidator.validate(updateImportInput);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }
      const updatedImpt = await this.importsRepository.update(id, updateImportInput);

      const columns = await this.columnsService.find(updateImportInput);

      // const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
      //   updateImportInput
      // );

      // if (!idColumnUnique) {
      //   responseHandler.setError(
      //     409,
      //     'Provided id column includes duplicate values'
      //   );
      //   return responseHandler;
      // }


      responseHandler.setSuccess(200, {
        importId: impt._id,
        updatedImpt
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

      const columns = await this.columnsService.find(impt);
      responseHandler.setSuccess(200, {
        importId: impt._id,
        columns
      });
      return responseHandler;
    } catch (error) {
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

  async start(id: string, accessToken?: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      // const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
      //   impt
      // );
      // if (!idColumnUnique) {
      //   responseHandler.setError(
      //     409,
      //     'Provided id column includes duplicate values'
      //   );
      //   return responseHandler;
      // }

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

      const process = await this.importProcessesRepository.create({
        unit: impt.unit as string,
        import: impt._id
      });

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.transferService.transfer(impt, process);
      responseHandler.setSuccess(200, process._id);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ImportsService;
