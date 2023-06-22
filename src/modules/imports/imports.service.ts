import ImportsRepository from './imports.repository';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { FieldValidator } from './validators/field.validator';
import { CreateUpdateImportValidator } from './validators/create-update-import.validator';
import runImport from '../../run-import/run-import';
import findColumns from '../../find-columns/find-columns';
import { IImport } from './import.schema';
import { IField } from './sub-schemas/field.schema';

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

  async create(createImportInput: IImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateUpdateImportValidator.validate(createImportInput);
      if (error) {
        responseHandler.setError(400, error);
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

  async update(
    id: string,
    updateImportInput: IImport
  ): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await ImportsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { error } = CreateUpdateImportValidator.validate(updateImportInput);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const columns = await findColumns(updateImportInput);
      await ImportsRepository.update(id, updateImportInput);

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
      const impt = await ImportsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }
      await ImportsRepository.delete(id);
      responseHandler.setSuccess(200, 'Deleted');
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

  async setFields(id: string, fieldInputs: IField[]): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await ImportsRepository.findById(id);
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
    try {
      const impt = await ImportsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const pendingImport = await ImportProcessesRepository.findPendingByUnit(
        impt.unit.toString()
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
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default new ImportsService();
