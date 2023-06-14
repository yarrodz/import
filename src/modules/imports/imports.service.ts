import { validate } from 'class-validator';

import Import from './import.schema';
import ImportProcess from '../import-processes/import-process.schema';
import { IImportModel } from './import.schema';
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
import Websocket from '../../utils/websocket/websocket';
import emitProgress from './helpers/emit-progress';

const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY_TIME = 5000;

class ImportsService {
  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const imports = await Import.find({ unit });
      responseHandler.setSuccess(200, imports);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async findAllProcesses(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const importProcesses = await ImportProcess.find({ unit });
      responseHandler.setSuccess(200, importProcesses);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async connect(connectInput: ConnectInput): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const errors = await validate(connectInput);
      if (errors.length) {
        responseHandler.setError(400, formatValidationErrors(errors));
        return responseHandler;
      }
      const columns = await this.receiveColums(connectInput);
      const imp = await Import.create(connectInput);
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
    id: string,
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

      await imp.updateOne({ fields: fieldInputs });
      responseHandler.setSuccess(200, 'Fields for import are set');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async start(id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    const imp = await Import.findById(id);
    if (!imp) {
      responseHandler.setError(404, 'Import not found');
      return responseHandler;
    }

    const pendingImport = await this.findPendingImportByUnit(
      imp.unit.toString()
    );
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

    return await this.run(imp, importProcess);
  }

  async pause(processId: string) {
    const responseHandler = new ResponseHandler();
    try {
      const io = Websocket.getInstance();
      const importProcess = await ImportProcess.findById(processId);
      if (!importProcess) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      const pausedProcess = await ImportProcess.findOneAndUpdate(
        importProcess._id,
        { status: ImportStatus.PAUSED },
        { new: true }
      );
      emitProgress(io, importProcess.unit.toString(), pausedProcess);
      responseHandler.setSuccess(200, 'Import paused by user');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(processId: string) {
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

    const pendingImport = await this.findPendingImportByUnit(
      imp.unit.toString()
    );
    if (pendingImport) {
      responseHandler.setError(
        409,
        'This unit is currently processing another import'
      );
      return responseHandler;
    }

    const reloadedImportProcess = await ImportProcess.findByIdAndUpdate(processId, {
      status: ImportStatus.PENDING
    });

    return await this.run(imp, reloadedImportProcess);
  }

  async retry(processId: string) {
    const responseHandler = new ResponseHandler();
    try {
      const importProcess = await ImportProcess.findById(processId);
      if (!importProcess) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }
      const retriedProcess = await ImportProcess.findByIdAndUpdate(
        processId,
        {
          attempts: 0,
          status: ImportStatus.PENDING,
          errorMessage: null
        },
        { new: true }
      );

      const imp = await Import.findById(retriedProcess.import);
      if (!imp) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }
      return await this.run(imp, retriedProcess);
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  private async receiveColums(connectInput: ConnectInput) {
    let columns: IColumn[] = [];
    switch (connectInput.source) {
      case ImportSource.POSTGRESQL:
        columns = await receivePostgresColumns(connectInput);
        break;
      case ImportSource.API:
        columns = await receiveApiColumns(connectInput);
        break;
      case ImportSource.IMAP:
        throw new Error('Not implemented');
      default:
        throw new Error('Unexpected import source');
    }
    return columns;
  }

  private async run(imp: IImportModel, importProcess: IImportProcessModel): Promise<ResponseHandler> {
    try {
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
      const responseHandler = new ResponseHandler();
      responseHandler.setSuccess(200, 'Import complete or paused by user');
      return responseHandler;
    } catch (error) {
      return this.catchError(error, imp, importProcess);
    }
  }

  private async catchError(
    error: Error,
    imp: IImportModel,
    importProcess: IImportProcessModel
  ) {
    const reloadedProcess = await ImportProcess.findById(importProcess._id);

    if (reloadedProcess.attempts !== MAX_ATTEMPTS) {
      await importProcess.updateOne({ $inc: { attempts: 1 } });
      await this.delayAttempt();
      return await this.run(imp, reloadedProcess);
    } else {
      const failedProcess = await ImportProcess.findOneAndUpdate(
        importProcess._id,
        {
          status: ImportStatus.FAILED,
          errorMessage: error.message
        },
        { new: true }
      );

      const io = Websocket.getInstance();
      emitProgress(io, imp.unit.toString(), failedProcess);

      const responseHandler = new ResponseHandler();
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  private delayAttempt() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), ATTEMPT_DELAY_TIME);
    });
  }

  private async findPendingImportByUnit(unit: string) {
    return await ImportProcess.findOne({
      unit,
      status: ImportStatus.PENDING
    });
  }
}

export default new ImportsService();
