import { Request } from 'express';

// import { SqlImportService } from '../sql/sql-import.service';
// import { ApiImportService } from '../api/api-import.service';
// import { EmailImportService } from '../email/email-import.service';
import { TransfersRepository } from './transfers.repository';
import { TransferProcessesRepository } from '../transfer-processes/transfer-processes.repository';
import { ResponseHandler } from '../../utils/response-handler/response-handler';
// import { Source } from '../oauth2/enums/source.enum';
import { TransferStatus } from '../transfer-processes/enums/transfer-status.enum';

export class TransfersService {
  // private sqlImportService: SqlImportService;
  // private apiImportService: ApiImportService;
  // private emailImportService: EmailImportService;
  constructor(
    private transfersRepository: TransfersRepository,
    private transferProcessesRepository: TransferProcessesRepository
  ) {}

  async getAll(select: any, sortings: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const imports = await this.transfersRepository.query(
        select,
        sortings,
        false
      );
      return responseHandler.setSuccess(200, imports);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async get(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.transfersRepository.load(id);
      return responseHandler.setSuccess(200, impt);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async create(input: any, getColumns: boolean): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
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
      return responseHandler.setError(500, error.message);
    }
  }

  async update(
    req: Request,
    input: any,
    getColumns: boolean,
    start: boolean
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
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
          return responseHandler.setError(
            400,
            `Error while creating import. Unknown source '${source}'.`
          );
        }
      }
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async delete(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.transfersRepository.load(id);

      if (impt === undefined) {
        return responseHandler.setError(404, 'Import not found');
      }

      const transfer = await this.transferProcessesRepository.query(
        {
          operator: 'and',
          conditions: [
            {
              type: 'hasEdge',
              direction: 'in',
              label: 'inImport',
              value: id
            }
          ]
        },
        {},
        true
      );

      if (transfer) {
        return responseHandler.setError(
          409,
          'Import cannot be deleted. There are transfers related to this import.'
        );
      }

      await this.transfersRepository.delete(id);
      return responseHandler.setSuccess(200, true);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async getColumns(req: Request, id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.transfersRepository.load(id);

      if (impt === undefined) {
        return responseHandler.setError(404, 'Import not found');
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
      return responseHandler.setError(500, error.message);
    }
  }

  async checkIdColumnUniqueness(
    req: Request,
    id: number
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.transfersRepository.load(id);

      if (impt === undefined) {
        return responseHandler.setError(404, 'Import not found');
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
          return responseHandler.setSuccess(200, true);
        }
        default: {
          return responseHandler.setError(
            400,
            `Error while checking column uniqueness. Unknown source '${source}'.`
          );
        }
      }
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async checkImport(
    req: Request,
    connection: any,
    impt: any
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlImportService.checkImport(connection, impt);
        }
        case Source.API: {
          responseHandler.setError(400, 'Not implemented');
          return responseHandler;
        }
        case Source.EMAIL: {
          return await this.emailImportService.checkImport(connection, impt);
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

  async startImport(req: Request, id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.transfersRepository.load(id);

      if (impt === undefined) {
        return responseHandler.setError(404, 'Import not found');
      }

      const { fields } = impt;

      if (fields === undefined) {
        return responseHandler.setError(400, 'Fields for import not set.');
      }

      const { id: unitId } = impt.__.inUnit;

      const pendingUnitTransfer = await this.transferProcessesRepository.query(
        {
          operator: 'and',
          conditions: [
            {
              type: 'equals',
              property: 'status',
              value: TransferStatus.PENDING
            },
            {
              type: 'hasEdge',
              direction: 'in',
              label: 'inUnit',
              value: unitId
            }
          ]
        },
        {},
        true
      );
      if (pendingUnitTransfer) {
        return responseHandler.setError(
          409,
          'This unit is already processing another transfer.'
        );
      }

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlImportService.startImport(impt);
        }
        case Source.API: {
          return await this.apiImportService.startImport(req, impt);
        }
        case Source.EMAIL: {
          return await this.emailImportService.startImport(impt);
        }
        default: {
          return responseHandler.setError(
            400,
            `Error while starting import. Unknown import source '${source}'.`
          );
        }
      }
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }
}
