import { Types } from 'mongoose';
import { validate } from 'class-validator';

import Import from './import.schema';
import ImportProcess from '../import-processes/import-process.schema';
import { IImportModel } from './import.schema';
import { IFieldModel } from './sub-schemas/field.schema';
import { IImportProcessModel } from '../import-processes/import-process.schema';
import { ImportSource } from './enums/import-source.enum';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import { postgresImport } from './executors/postgres.import';
import { apiImport } from './executors/api.import';
import { imapImport } from './executors/imap.import';
import { IColumn } from './intefaces/column.interface';
import { receivePostgresColumns } from './columns/postgres.columns';
import { receiveApiColumns } from './columns/api.columns';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { ConnectInput } from './inputs/connect.input';
import { FieldInput } from './inputs/field.input';
import { formatValidationErrors } from '../../utils/format-validation-errors/format-validation-errors';

const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY_TIME = 5000;

class ImportsService {
  async connect(connectInput: ConnectInput): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const errors = await validate(connectInput);
      if (errors.length) {
        responseHandler.setError(400, formatValidationErrors(errors));
        return responseHandler;
      }

      const imp = await Import.create(connectInput);
      const columns = await this.receiveColums(imp);
      responseHandler.setSuccess(200, {
        id: imp._id,
        columns
      });
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async setFields(
    id: Types.ObjectId,
    fieldInputs: FieldInput[]
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const imp = await Import.findById(id);
      if (!imp) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const errorsArray = await Promise.all(
        fieldInputs.map(async (fieldInput) => {
          return await validate(fieldInput);
        })
      );
      for (let errors of errorsArray) {
        if (errors.length) {
          responseHandler.setError(400, formatValidationErrors(errors));
          return responseHandler;
        }
      }

      await Import.updateOne({ fields: fieldInputs });
      responseHandler.setSuccess(200, 'Fields for import are set');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async start(id: Types.ObjectId): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    const imp = await Import.findById(id);
    if (!imp) {
      responseHandler.setError(404, 'Import not found');
      return responseHandler;
    }

    const pendingImport = await ImportProcess.findOne({
      unit: imp.unit,
      status: ImportStatus.PENDING
    });
    if (pendingImport) {
      responseHandler.setError(
        409,
        'This unit is currently processing another import'
      );
      return responseHandler;
    }

    const importProcess = await ImportProcess.create({
      unit: imp.unit,
      import: imp._id
    });

    try {
      await this.run(imp, importProcess);
      responseHandler.setSuccess(200, 'Import complete or paused');
      return responseHandler;
    } catch (error) {
      await this.catchError(error, importProcess);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async pause(processId: Types.ObjectId) {
    const responseHandler = new ResponseHandler();
    try {
      const importProcess = await ImportProcess.findById(processId);
      if (!importProcess) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }
      await importProcess.updateOne({ status: ImportStatus.PAUSED });
      responseHandler.setSuccess(200, 'Import paused by user');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(processId: Types.ObjectId) {
    const responseHandler = new ResponseHandler();
    const importProcess = await ImportProcess.findById(processId);
    if (!importProcess) {
      responseHandler.setError(404, 'Import process not found');
      return responseHandler;
    }

    const imp = await Import.findById(importProcess.import);
    if (!imp) {
      responseHandler.setError(404, 'Import not found');
      return responseHandler;
    }

    const pendingImport = await ImportProcess.findOne({
      unit: imp.unit,
      status: ImportStatus.PENDING
    });
    if (pendingImport) {
      responseHandler.setError(
        409,
        'This unit is currently processing another import'
      );
      return responseHandler;
    }

    await importProcess.updateOne({
      status: ImportStatus.PENDING
    });

    try {
      await this.run(imp, importProcess);
      responseHandler.setSuccess(200, 'Import paused by user or complete');
      return responseHandler;
    } catch (error) {
      await this.catchError(error, importProcess);
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(processId: Types.ObjectId) {
    const responseHandler = new ResponseHandler();
    try {
      const importProcess = await ImportProcess.findById(processId);
      if (!importProcess) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }
      await importProcess.updateOne({
        attempts: 0,
        status: ImportStatus.PENDING,
        errorMessage: null
      });
      return await this.reload(processId);
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  private async receiveColums(imp: IImportModel) {
    let columns: IColumn[] = [];
    switch (imp.source) {
      case ImportSource.POSTGRESQL:
        columns = await receivePostgresColumns(imp);
        break;
      case ImportSource.API:
        columns = await receiveApiColumns(imp);
        break;
      case ImportSource.IMAP:
        break;
      default:
        throw new Error('Unexpected import source');
    }
    return columns;
  }

  private async run(imp: IImportModel, importProcess: IImportProcessModel) {
    switch (imp.source) {
      case ImportSource.POSTGRESQL:
        await postgresImport(imp, importProcess);
        break;
      case ImportSource.API:
        await apiImport(imp, importProcess);
        break;
      case ImportSource.IMAP:
        await imapImport(imp, importProcess);
        break;
      default:
        throw new Error('Unexpected import source');
    }
  }

  private async catchError(error: Error, importProcess: IImportProcessModel) {
    if (importProcess.attempts !== MAX_ATTEMPTS) {
      await importProcess.updateOne({ $inc: { attempts: 1 } });
      await this.delayAttempt();
      return await this.reload(importProcess._id);
    } else {
      await importProcess.updateOne({
        status: ImportStatus.FAILED,
        errorMessage: error.message
      });
    }
  }

  private delayAttempt() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), ATTEMPT_DELAY_TIME);
    });
  }
}

export default new ImportsService();
