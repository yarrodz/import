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

class ImportsService {
  private importsRepository: ImportsRepository;
  private importProcessesRepository: ImportProcessesRepository;
  private connectionService: ConnectionService;
  private columnsService: ColumnsService;
  private transferService: TransferService;

  constructor(
    importsRepository: ImportsRepository,
    importProcessesRepository: ImportProcessesRepository,
    connectionService: ConnectionService,
    columnsService: ColumnsService,
    transferService: TransferService
  ) {
    this.importsRepository = importsRepository;
    this.importProcessesRepository = importProcessesRepository;
    this.connectionService = connectionService;
    this.columnsService = columnsService;
    this.transferService = transferService;
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
        console.log(error);
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const impt = await this.importsRepository.create(createImportInput);

      const context: IImportContext = {
        action: ImportContextAction.CONNECT,
        importId: impt._id
      };
      const connectionResult = await this.connectionService.connect(
        req,
        impt,
        context
      );

      if (connectionResult.state === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = connectionResult.oAuth2AuthUri;
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }

      const columns = await this.columnsService.find(createImportInput);

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
        importId: impt._id,
        columns
      });
      return responseHandler;
    } catch (error) {
      console.error(error);

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
      const context: IImportContext = {
        action: ImportContextAction.CONNECT,
        importId: impt._id
      };
      const connectionResult = await this.connectionService.connect(
        req,
        impt,
        context
      );

      if (connectionResult.state === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = connectionResult.oAuth2AuthUri;
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }
      const columns = await this.columnsService.find(updateImportInput);
      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        updateImportInput
      );

      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

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
      console.log('connect');

      const context: IImportContext = {
        action: ImportContextAction.CONNECT,
        importId: impt._id
      };
      const connectionResult = await this.connectionService.connect(
        req,
        impt,
        context
      );
      console.log('2');

      if (connectionResult.state === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = connectionResult.oAuth2AuthUri;
        responseHandler.setSuccess(201, authUri);
        return responseHandler;
      }
      const columns = await this.columnsService.find(impt);
      console.log('3');

      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        impt
      );
      console.log('4');

      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

      responseHandler.setSuccess(200, {
        importId: impt._id,
        columns
      });
      return responseHandler;
    } catch (error) {
      console.error(error);

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
        importId: impt._id
      };
      const connectionResult = await this.connectionService.connect(
        req,
        impt,
        context
      );

      if (connectionResult.state === ConnectionState.OAUTH2_REQUIRED) {
        const authUri = connectionResult.oAuth2AuthUri;
        responseHandler.setSuccess(201, authUri);
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
      console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ImportsService;
