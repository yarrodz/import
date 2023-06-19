import { validate } from 'class-validator';

import ImportsRepository from './imports.repository';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { FieldInput } from './inputs/field.input';
import { formatValidationErrors } from '../../utils/format-validation-errors/format-validation-errors';
import { CreateImportInput } from './inputs/create-import.input';
import runImport from './import-runners/run-import';
import findColumns from './columns/find-columns';

class ImportsService {
  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const imports = await ImportsRepository.findAll(unit);
      responseHandler.setSuccess(200, imports);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async create(createImportInput: CreateImportInput): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const errors = await validate(createImportInput);
      if (errors.length) {
        responseHandler.setError(400, formatValidationErrors(errors));
        return responseHandler;
      }

      const columns = await findColumns(createImportInput);
      const impt = await ImportsRepository.create(createImportInput);

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

  async connect(id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await ImportsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const columns = await findColumns(impt);
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

  async setFields(
    id: string,
    fieldInputs: FieldInput[]
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await ImportsRepository.findById(id);
      if (!impt) {
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

      const updatedImport = await ImportsRepository.update(id, {
        fields: fieldInputs
      });
      responseHandler.setSuccess(200, updatedImport);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async start(id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    const impt = await ImportsRepository.findById(id);
    if (!impt) {
      responseHandler.setError(404, 'Import not found');
      return responseHandler;
    }

    const pendingImport = await ImportProcessesRepository.findPendingByUnit(
      impt.unit as string
    );
    if (pendingImport) {
      responseHandler.setError(
        409,
        'This unit is currently processing another import'
      );
      return responseHandler;
    }

    const process = await ImportProcessesRepository.create({
      unit: impt.unit as string,
      import: impt._id
    });

    // We dont need to wait till import executes,
    // We send of id import process
    // Client send websocket request and then sends event 'join' with processId
    runImport(impt, process);
    responseHandler.setSuccess(200, process._id);
    return responseHandler;
  }
}

export default new ImportsService();
