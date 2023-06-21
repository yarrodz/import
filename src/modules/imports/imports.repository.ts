import { UpdateQuery } from 'mongoose';
import Import, { IImport, IImportDocument } from './import.schema';
import { CreateImportInput } from './inputs/create-import.input';

class ImportsRepository {
  async create(input: CreateImportInput): Promise<IImportDocument> {
    try {
      return await Import.create(input);
    } catch (error) {
      throw new error(
        `Error while query for creating import: ${error.message}`
      );
    }
  }

  async findAll(unit: string): Promise<IImportDocument[]> {
    try {
      return await Import.find({ unit }).lean();
    } catch (error) {
      throw new error(`Error while quering imports: ${error.message}`);
    }
  }

  async findById(id: string): Promise<IImportDocument> {
    try {
      return await Import.findById(id).lean();
    } catch (error) {
      throw new error(`Error while quering import: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateQuery: UpdateQuery<IImport>
  ): Promise<IImport> {
    try {
      return await Import.findByIdAndUpdate(id, updateQuery, { new: true });
    } catch (error) {
      throw new error(
        `Error while query for updating import: ${error.message}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await Import.findByIdAndDelete(id);
    } catch (error) {
      throw new error(`Error while query for delete import: ${error.message}`);
    }
  }
}

export default new ImportsRepository();
