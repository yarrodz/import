import { Request } from 'express';

import ImportProcessesRepository from './import-processes.repository';
import ImportsRepository from '../imports/imports.repository';
import SqlImportService from '../sql/sql-import.service';
import ApiImportService from '../api/api-import.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { ImportStatus } from './enums/import-status.enum';
import { ImportSource } from '../imports/enums/import-source.enum';

class ImportProcessesService {
  private importProcessesRepository: ImportProcessesRepository;
  private importsRepository: ImportsRepository;
  private sqlImportService: SqlImportService;
  private apiImportService: ApiImportService;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    importsRepository: ImportsRepository,
    sqlImportService: SqlImportService,
    apiImportService: ApiImportService
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.importsRepository = importsRepository;
    this.sqlImportService = sqlImportService;
    this.apiImportService = apiImportService;
  }

  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const processes = await this.importProcessesRepository.findAll(unit);
      responseHandler.setSuccess(200, processes);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status === ImportStatus.PENDING) {
        responseHandler.setError(
          409,
          'Pending import process cannot be deleted'
        );
        return responseHandler;
      }

      await this.importProcessesRepository.delete(id);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async pause(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status !== ImportStatus.PENDING) {
        responseHandler.setError(
          409,
          'Only pending import process can be paused'
        );
        return responseHandler;
      }

      await this.importProcessesRepository.update(id, {
        status: ImportStatus.PAUSED
      });

      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(req: Request, id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status !== ImportStatus.PAUSED) {
        responseHandler.setError(
          409,
          'Only paused import process can be reloaded'
        );
        return responseHandler;
      }

      const impt = await this.importsRepository.findById(
        process.import.toString()
      );
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const pendingImport =
        await this.importProcessesRepository.findPendingByUnit(
          impt.unit as string
        );
      if (pendingImport) {
        responseHandler.setError(
          409,
          'This unit is currently processing another import'
        );
        return responseHandler;
      }

      const { source } = impt;

      switch (source) {
        case ImportSource.SQL: {
          return await this.sqlImportService.reload(impt, process);
        }
        case ImportSource.API: {
          return await this.apiImportService.reload(req, impt, process);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while reloading import. Unknown import source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(req: Request, id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await this.importProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      if (process.status !== ImportStatus.FAILED) {
        responseHandler.setError(
          409,
          'Only failed import process can be retried'
        );
        return responseHandler;
      }

      const impt = await this.importsRepository.findById(
        process.import.toString()
      );
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }
      const { source } = impt;

      switch (source) {
        case ImportSource.SQL: {
          return await this.sqlImportService.retry(impt, process);
        }
        case ImportSource.API: {
          return await this.apiImportService.retry(req, impt, process);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while reloading import. Unknown import source '${source}'.`
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

export default ImportProcessesService;
