import ImportsRepository from './imports.repository';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import TransferService from '../transfer/transfer.service';
import ColumnsService from '../columns/columns.service';
import ResponseHandler from '../../utils/response-handler/response-handler';
import { FieldValidator } from './validators/field.validator';
import { CreateUpdateImportValidator } from './validators/create-update-import.validator';
import { IImport } from './import.schema';
import { IField } from './sub-schemas/field.schema';

class ImportsService {
  private importsRepository: ImportsRepository;
  private importProcessesRepository: ImportProcessesRepository;
  private columnsService: ColumnsService;
  private transferService: TransferService;

  constructor(
    importsRepository: ImportsRepository,
    importProcessesRepository: ImportProcessesRepository,
    columnsService: ColumnsService,
    transferService: TransferService
  ) {
    this.importsRepository = importsRepository;
    this.importProcessesRepository = importProcessesRepository;
    this.columnsService = columnsService;
    this.transferService = transferService;
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

  async create(createImportInput: IImport): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const { error } = CreateUpdateImportValidator.validate(createImportInput);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const columns = await this.columnsService.find(createImportInput);

      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        createImportInput
      );
      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

      const impt = await this.importsRepository.create(createImportInput);

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
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const { error } = CreateUpdateImportValidator.validate(updateImportInput);
      if (error) {
        responseHandler.setError(400, error);
        return responseHandler;
      }

      const columns = await this.columnsService.find(updateImportInput);

      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        updateImportInput
      );

      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
        return responseHandler;
      }

      await this.importsRepository.update(id, updateImportInput);

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

  async connect(id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const columns = await this.columnsService.find(impt);
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

  async start(id: string): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const impt = await this.importsRepository.findById(id);
      if (!impt) {
        responseHandler.setError(404, 'Import not found');
        return responseHandler;
      }

      const idColumnUnique = await this.columnsService.checkIdColumnUniqueness(
        impt
      );
      if (!idColumnUnique) {
        responseHandler.setError(
          409,
          'Provided id column includes duplicate values'
        );
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

      const process = await this.importProcessesRepository.create({
        unit: impt.unit as string,
        import: impt._id
      });

      // We dont need to wait till import executes,
      // We send of id import process
      // Client send websocket request and then sends event 'join' with processId
      this.transferService.transfer(impt, process);
      responseHandler.setSuccess(200, process._id);
      return responseHandler;
    } catch (error) {
      responseHandler.setError(500, error.message);
      return responseHandler;
    }
  }
}

export default ImportsService;
