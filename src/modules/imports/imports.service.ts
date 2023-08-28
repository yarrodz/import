import { Request } from 'express';

import ProcessesRepository from '../processes/process.repository';
import SqlImportService from '../sql/sql-import.service';
import ApiImportService from '../api/api-import.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { Source } from './enums/source.enum';
import { CreateSqlImportValidator } from '../sql/validators/create-sql-import.validator';
import { CreateApiImportValidator } from '../api/validators/create-api-import.validator';
import { UpdateSqlImportValidator } from '../sql/validators/update-sql-import.validator';
import { UpdateApiImportValidator } from '../api/validators/update-api-import.validator';
import TransfersRepository from '../transfers/transfers.repository';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import EmailImportService from '../email/email-import.service';

class ImportsService {
  private sqlImportService: SqlImportService;
  private apiImportService: ApiImportService;
  private emailImportService: EmailImportService;
  private processesRepository: ProcessesRepository;
  private transfersRepository: TransfersRepository;

  constructor(
    sqlImportService: SqlImportService,
    apiImportService: ApiImportService,
    emailImportService: EmailImportService,
    processesRepository: ProcessesRepository,
    transfersRepository: TransfersRepository
  ) {
    this.sqlImportService = sqlImportService;
    this.apiImportService = apiImportService;
    this.emailImportService = emailImportService;
    this.processesRepository = processesRepository;
    this.transfersRepository = transfersRepository;
  }

  async getAll(select: any, sortings: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const imports = await this.processesRepository.query(
        select,
        sortings,
        false
      );
      responseHandler.setSuccess(200, imports);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async get(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.load(id);
      responseHandler.setSuccess(200, impt);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async create(input: any, getColumns: boolean): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      const { source } = input;

      switch (source) {
        case Source.SQL: {
          return this.sqlImportService.create(input, getColumns);
        }
        case Source.API: {
          return this.apiImportService.create(input, getColumns);
        }
        case Source.EMAIL: {
          return this.emailImportService.create(input, getColumns);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating import. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      console.error(error)
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(req: Request, input: any, getColumns: boolean, start: boolean): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      const { source } = input;

      switch (source) {
        case Source.SQL: {
          return this.sqlImportService.update(input, getColumns, start);
        }
        case Source.API: {
          return this.apiImportService.update(req, input, getColumns, start);
        }
        case Source.EMAIL: {
          return this.emailImportService.update(input, getColumns, start);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating import. Unknown source '${source}'.`
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
      const impt = await this.processesRepository.load(id);

      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      await this.processesRepository.delete(id);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async getColumns(req: Request, id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.load(id);

      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }
      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlImportService.getColumns(impt);
        }
        case Source.API: {
          return await this.apiImportService.getColumns(req, impt);
        }
        case Source.EMAIL: {
          return await this.emailImportService.getColumns(impt);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while getting columns. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async checkIdColumnUniqueness(
    req: Request,
    id: number
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.load(id);

      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlImportService.checkIdColumnUniqueness(impt);
        }
        case Source.API: {
          return await this.apiImportService.checkIdColumnUniqueness(req, impt);
        }
        case Source.EMAIL: {
          return await this.emailImportService.checkIdColumnUniqueness(impt);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while getting columns. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(req: Request, id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.load(id);

      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { fields } = impt;

      if (fields === undefined) {
        responseHandler.setError(400, 'Fields for import not set.');
        return responseHandler;
      }

      const { id: unitId } = impt.__.inUnit;

      // const pendingUnitTransfer = await this.transfersRepository.query(
      //   {
      //     operator: 'and',
      //     conditions: [
      //       {
      //         type: 'equals',
      //         property: 'status',
      //         value: TransferStatus.PENDING
      //       },
      //       {
      //         type: 'inEdge',
      //         label: 'inUnit',
      //         value: unitId
      //       }
      //     ]
      //   },
      //   {},
      //   true
      // );
      // if (pendingUnitTransfer) {
      //   responseHandler.setError(
      //     409,
      //     'This unit is already processing another transfer.'
      //   );
      //   return responseHandler;
      // }

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlImportService.import(impt);
        }
        case Source.API: {
          return await this.apiImportService.import(req, impt);
        }
        case Source.EMAIL: {
          return await this.emailImportService.import(impt);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while starting import. Unknown import source '${source}'.`
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

export default ImportsService;
