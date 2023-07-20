import { Request } from 'express';

import ImportsRepository from './imports.repository';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import SqlImportService from '../sql/sql-import.service';
import ApiImportService from '../api/api-import.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { ImportValidator } from './import.validator';
import { IImport } from './import.schema';
import { FieldValidator } from './validators/field.validator';
import { IField } from './sub-schemas/field.schema';
import { ImportSource } from './enums/import-source.enum';

class ImportsService {
  private importsRepository: ImportsRepository;
  private importProcessesRepository: ImportProcessesRepository;
  private sqlImportService: SqlImportService;
  private apiImportService: ApiImportService;

  constructor(
    importsRepository: ImportsRepository,
    importProcessesRepository: ImportProcessesRepository,
    sqlImportService: SqlImportService,
    apiImportService: ApiImportService
  ) {
    this.importsRepository = importsRepository;
    this.importProcessesRepository = importProcessesRepository;
    this.sqlImportService = sqlImportService;
    this.apiImportService = apiImportService;
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
    let responseHandler = new ResponseHandler();
    try {
      const { error } = ImportValidator.validate(createImportInput);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }
      const impt = await this.importsRepository.create(createImportInput);
      const { source } = impt;

      switch (source) {
        case ImportSource.SQL: {
          return await this.sqlImportService.connect(impt);
        }
        case ImportSource.API: {
          return await this.apiImportService.connect(req, impt);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating import. Unknown import source '${source}'.`
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

      const updatedImport = await this.importsRepository.update(
        id,
        updateImportInput
      );
      const { source } = impt;

      switch (source) {
        case ImportSource.SQL: {
          return await this.sqlImportService.connect(updatedImport);
        }
        case ImportSource.API: {
          return await this.apiImportService.connect(req, updatedImport);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating import. Unknown import source '${source}'.`
          );
          return responseHandler;
        }
      }
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
      const { source } = impt;

      switch (source) {
        case ImportSource.SQL: {
          return await this.sqlImportService.connect(impt);
        }
        case ImportSource.API: {
          return await this.apiImportService.connect(req, impt);
        }
        default: {
          responseHandler.setError(
            400,
            `Error while creating import. Unknown import source '${source}'.`
          );
          return responseHandler;
        }
      }
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

      const { source } = impt;

      switch (source) {
        case ImportSource.SQL: {
          return await this.sqlImportService.start(impt);
        }
        case ImportSource.API: {
          return await this.apiImportService.start(req, impt);
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
