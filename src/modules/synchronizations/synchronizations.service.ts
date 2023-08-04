import { Request } from 'express';

import { iFrameSynchronization, iFrameProcess } from 'iframe-ai';
import SqlSynchronizationService from '../sql/sql-synchronization.service';
import ApiSynchronizationService from '../api/api-synchronization.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import Synchronization from './interfaces/synchronization.interface';
import { SynchronizationValidator } from './validators/synchronization.validator';
import dbClient from '../../utils/db-client/db-client';
import { SynchronizationSource } from './enums/synchronization-source.enum';
import ImportField from './interfaces/import-field.interface';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

class SynchronizationsService {
  private sqlSynchronizationService: SqlSynchronizationService;
  private apiSynchronizationService: ApiSynchronizationService;

  constructor(
    sqlSynchronizationService: SqlSynchronizationService,
    apiSynchronizationService: ApiSynchronizationService
  ) {
    this.sqlSynchronizationService = sqlSynchronizationService;
    this.apiSynchronizationService = apiSynchronizationService;
  }

  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      // const synchronizations = await this.importsRepository.findAll(unit);
      // responseHandler.setSuccess(200, synchronizations);
      // return responseHandler;
      responseHandler.setSuccess(200, []);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async create(
    req: Request,
    createSynchronizationInput: Synchronization
  ): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      const { error } = SynchronizationValidator.validate(
        createSynchronizationInput
      );
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      let {
        synchronization,
        unit,
        connection,
        import: impt,
        export: expt
      } = await new iFrameSynchronization(dbClient).insertOne(
        dbClient,
        createSynchronizationInput
      );
      synchronization = {
        ...transformIFrameInstance(synchronization),
        unit: transformIFrameInstance(unit),
        connection: transformIFrameInstance(connection),
        import: transformIFrameInstance(impt),
        export: transformIFrameInstance(expt)
      };

      const { source } = synchronization;

      switch (source) {
        case SynchronizationSource.SQL: {
          return await this.sqlSynchronizationService.getColumns(
            synchronization
          );
        }
        case SynchronizationSource.API: {
          return await this.apiSynchronizationService.getColumns(
            req,
            synchronization
          );
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating synchronization. Unknown synchronization source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async update(
    req: Request,
    id: string,
    updateSynchronizationInput: Synchronization
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    responseHandler.setSuccess(200, true);
    return responseHandler;
    try {
      //   const impt = await this.importsRepository.findById(id);
      //   if (!impt) {
      //     responseHandler.setError(404, 'Import not found');
      //     return responseHandler;
      //   }
      //   const { error } = ImportValidator.validate(updateImportInput);
      //   if (error) {
      //     responseHandler.setError(400, error);
      //     return responseHandler;
      //   }
      //   const updatedImport = await this.importsRepository.update(
      //     id,
      //     updateImportInput
      //   );
      //   const { source } = impt;
      //   switch (source) {
      //     case ImportSource.SQL: {
      //       return await this.sqlImportService.connect(updatedImport);
      //     }
      //     case ImportSource.API: {
      //       return await this.apiImportService.connect(req, updatedImport);
      //     }
      //     default: {
      //       responseHandler.setError(
      //         400,
      //         `Error while creating import. Unknown import source '${source}'.`
      //       );
      //       return responseHandler;
      //     }
      //   }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async delete(id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      // const impt = await this.importsRepository.findById(id);
      // if (!impt) {
      //   responseHandler.setError(404, 'Import not found');
      //   return responseHandler;
      // }
      // await this.importsRepository.delete(id);
      responseHandler.setSuccess(200, true);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async getColumns(req: Request, id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      let {
        synchronization,
        unit,
        connection,
        import: impt,
        export: expt
      } = await new iFrameSynchronization(dbClient).getOneById(id);

      if (synchronization === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      synchronization = {
        ...transformIFrameInstance(synchronization),
        unit: transformIFrameInstance(unit),
        connection: transformIFrameInstance(connection),
        import: transformIFrameInstance(impt),
        export: transformIFrameInstance(expt)
      };

      const { source } = synchronization;

      switch (source) {
        case SynchronizationSource.SQL: {
          return await this.sqlSynchronizationService.getColumns(
            synchronization
          );
        }
        case SynchronizationSource.API: {
          return await this.apiSynchronizationService.getColumns(
            req,
            synchronization
          );
        }
        default: {
          responseHandler.setError(
            400,
            `Error while getting columns. Unknown synchronization source '${source}'.`
          );
          return responseHandler;
        }
      }
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async setImportFields(
    id: number,
    fieldInputs: ImportField[]
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      // const impt = await this.importsRepository.findById(id);
      // if (!impt) {
      //   responseHandler.setError(404, 'Import not found');
      //   return responseHandler;
      // }

      // const errorsArray = fieldInputs.map((fieldInput) => {
      //   const { error } = FieldValidator.validate(fieldInput);
      //   return error;
      // });
      // for (let error of errorsArray) {
      //   if (error) {
      //     responseHandler.setError(400, error);
      //     return responseHandler;
      //   }
      // }

      let {
        synchronization,
        unit,
        connection,
        import: impt,
        export: expt
      } = await new iFrameSynchronization(dbClient).getOneById(id);
      synchronization = {
        ...transformIFrameInstance(synchronization),
        unit: transformIFrameInstance(unit),
        connection: transformIFrameInstance(connection),
        import: transformIFrameInstance(impt),
        export: transformIFrameInstance(expt)
      };

      const { importId } = synchronization.import;

      const updatedImport = await new iFrameProcess(
        dbClient,
        {
          fields: fieldInputs
        },
        importId
      ).save();

      responseHandler.setSuccess(200, 'updatedImport');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async import(req: Request, id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      let {
        synchronization,
        unit,
        connection,
        import: impt,
        export: expt
      } = await new iFrameSynchronization(dbClient).getOneById(id);

      if (synchronization === undefined) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      synchronization = {
        ...transformIFrameInstance(synchronization),
        unit: transformIFrameInstance(unit),
        connection: transformIFrameInstance(connection),
        import: transformIFrameInstance(impt),
        export: transformIFrameInstance(expt)
      };

      const { source } = synchronization;

      switch (source) {
        case SynchronizationSource.SQL: {
          return await this.sqlSynchronizationService.import(synchronization);
        }
        case SynchronizationSource.API: {
          return await this.apiSynchronizationService.import(
            req,
            synchronization
          );
        }
        default: {
          responseHandler.setError(
            400,
            `Error while starting import. Unknown import source '${source}'.`
          );
          return responseHandler;
        }
      }

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
      console.log('Sync Error: ', error);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default SynchronizationsService;
