import ImportProcessesRepository from './import-processes.repository';
import ImportsRepository from '../imports/imports.repository';
import ResponseHandler from '../../utils/response-handler/response-handler';
import Websocket from '../../utils/websocket/websocket';
import emitProgress from '../../helpers/emit-progress';
import { ImportStatus } from './enums/import-status.enum';
import runImport from '../../run-import/run-import';

class ImportProcessesService {
  async findAll(unit: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const processes = await ImportProcessesRepository.findAll(unit);
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
      const process = await ImportProcessesRepository.findById(id);
      if (!process) {
        responseHandler.setError(404, 'Import process not found');
        return responseHandler;
      }

      await ImportProcessesRepository.delete(id);
      responseHandler.setSuccess(200, 'Deleted');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async pause(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const io = Websocket.getInstance();
      const process = await ImportProcessesRepository.findById(id);
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

      const pausedProcess = await ImportProcessesRepository.update(id, {
        status: ImportStatus.PAUSED
      });
      emitProgress(io, process._id.toString(), pausedProcess);

      responseHandler.setSuccess(200, 'Import paused by user');
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async reload(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await ImportProcessesRepository.findById(id);
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

      const impt = await ImportsRepository.findById(process.import.toString());
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

      const reloadedProcess = await ImportProcessesRepository.update(
        id,
        { status: ImportStatus.PENDING }
      );

      runImport(impt, reloadedProcess);
      responseHandler.setSuccess(200, id);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }

  async retry(id: string) {
    const responseHandler = new ResponseHandler();
    try {
      const process = await ImportProcessesRepository.findById(id);
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

      const impt = await ImportsRepository.findById(process.import.toString());
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const retriedProcess = await ImportProcessesRepository.update(id, {
        attempts: 0,
        status: ImportStatus.PENDING,
        errorMessage: null
      });

      runImport(impt, retriedProcess);
      responseHandler.setSuccess(200, id);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default new ImportProcessesService();
