import ImportProcess, {
  IImportProcess,
  IImportProcessDocument
} from './import-process.schema';
import { CreateImportProcessInput } from './inputs/create-imort-process.input';
import { ImportStatus } from './enums/import-status.enum';

class ImportProcessesRepository {
  async create(
    input: CreateImportProcessInput
  ): Promise<IImportProcessDocument> {
    try {
      return await ImportProcess.create(input);
    } catch (error) {
      throw new error(
        `Error while query for creating import: ${error.message}`
      );
    }
  }

  async findAll(unit: string): Promise<IImportProcessDocument[]> {
    try {
      return await ImportProcess.find({ unit }).lean();
    } catch (error) {
      throw new error(`Error while quering import processes: ${error.message}`);
    }
  }

  async findById(id: string): Promise<IImportProcessDocument> {
    try {
      return await ImportProcess.findById(id).lean();
    } catch (error) {
      throw new error(`Error while quering import process: ${error.message}`);
    }
  }

  async findPendingByUnit(unit: string): Promise<IImportProcessDocument> {
    return await ImportProcess.findOne({
      unit,
      status: ImportStatus.PENDING
    });
  }

  async update(
    id: string,
    updateAttrs: Partial<IImportProcess>
  ): Promise<IImportProcessDocument> {
    try {
      return await ImportProcess.findByIdAndUpdate(id, updateAttrs, {
        new: true
      });
    } catch (error) {
      throw new error(
        `Error while query for updating import process: ${error.message}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await ImportProcess.findByIdAndDelete(id);
    } catch (error) {
      throw new error(
        `Error while query for delete import process: ${error.message}`
      );
    }
  }
}

export default new ImportProcessesRepository();
