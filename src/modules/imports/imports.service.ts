import { Request } from 'express';

import ProcessesRepository from '../processes/process.repository';
import SqlImportService from '../sql/sql-import.service';
import ApiImportService from '../api/api-import.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { Source } from './enums/source.enum';
import { ProcessType } from '../processes/process.type.enum';

class ImportsService {
  private processesRepository: ProcessesRepository;
  private sqlImportService: SqlImportService;
  private apiImportService: ApiImportService;

  constructor(
    sqlImportService: SqlImportService,
    apiImportService: ApiImportService
  ) {
    this.processesRepository = new ProcessesRepository();
    this.sqlImportService = sqlImportService;
    this.apiImportService = apiImportService;
  }

  async getAll(
    unitId: number,
    connectionId: number
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const imports = await this.processesRepository.getAll({
        type: ProcessType.IMPORT,
        unitId,
        connectionId
      });
      responseHandler.setSuccess(200, imports);
      return responseHandler;
    } catch (error) {
      console.error('Error: ', error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async get(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.get(id);
      responseHandler.setSuccess(200, impt);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async create(input: any): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      // const { error } = ImportValidator.validate(
      //   createImportInput
      // );
      // if (error) {
      //   responseHandler.setError(400, error);
      //   return responseHandler;
      // }
      const impt = await this.processesRepository.create(input);
      responseHandler.setSuccess(200, impt);
      return responseHandler;
    } catch (error) {
      console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(input: any): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      // const { error } = ImportValidator.validate(
      //   createImportInput
      // );
      // if (error) {
      //   responseHandler.setError(400, error);
      //   return responseHandler;
      // }
      const impt = await this.processesRepository.update(input);
      responseHandler.setSuccess(200, impt);
      return responseHandler;
    } catch (error) {
      console.error(error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.get(id);
      if (!impt) {
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
      const impt = await this.processesRepository.get(id);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const unit = impt.__.inUnit.length && impt.__.inUnit[0];
      if (unit === undefined) {
        console.log('unit')
        responseHandler.setError(400, 'Unit for import not set.');
        return responseHandler;
      }

      const connection = impt.__.hasConnection.length && impt.__.hasConnection[0];
      if (connection === undefined) {
        console.log('connection')
        responseHandler.setError(400, 'Connection for import not set.');
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
      const impt = await this.processesRepository.get(id);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const unit = impt.__.inUnit.length && impt.__.inUnit[0];
      if (unit === undefined) {
        responseHandler.setError(400, 'Unit for import not set.');
        return responseHandler;
      }

      const connection = impt.__.hasConnection.length && impt.__.hasConnection[0];
      if (connection === undefined) {
        responseHandler.setError(400, 'Connection for import not set.');
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
        default: {
          responseHandler.setError(
            400,
            `Error while getting columns. Unknown source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      console.error('Error: ', error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(req: Request, id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.processesRepository.get(id);
      if (impt === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const unit = impt.__.inUnit.length && impt.__.inUnit[0];
      if (unit === undefined) {
        responseHandler.setError(400, 'Unit for import not set.');
        return responseHandler;
      }

      const connection = impt.__.hasConnection.length && impt.__.hasConnection[0];
      if (connection === undefined) {
        responseHandler.setError(400, 'Connection for import not set.');
        return responseHandler;
      }

      const { fields } = impt;
      if (fields === undefined) {
        responseHandler.setError(400, 'Fields for import not set.');
        return responseHandler;
      }

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlImportService.import(impt);
        }
        case Source.API: {
          return await this.apiImportService.import(req, impt);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while starting import. Unknown import source '${source}'.`
          );
          return responseHandler;
        }
      }

      // TO DO ADD CHECK 

      // const pendingImport =
      //   await this.importProcessesRepository.findPendingByUnit(
      //     impt.unit.toString()
      //   );
      // if (pendingImport) {
      //   responseHandler.setError(
      //     409,
      //     'This unit is currently processing another import'
      //   );
      //   return responseHandler;
      // }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ImportsService;
