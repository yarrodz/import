import { Model, Types, UpdateQuery } from 'mongoose';
import { IImport, IImportDocument } from './import.schema';

class ImportsRepository {
  private importsModel: Model<IImport>;

  constructor(importsModel: Model<IImport>) {
    this.importsModel = importsModel;
  }

  async create(input: IImport): Promise<IImportDocument> {
    try {
      const impt = await this.importsModel.create(input);
      return impt.toObject();
    } catch (error) {
      throw new error(
        `Error while query for creating import: ${error.message}`
      );
    }
  }

  async findAll(unit: string): Promise<IImportDocument[]> {
    try {
      return await this.importsModel.find({ unit }).lean();
    } catch (error) {
      throw new error(`Error while quering imports: ${error.message}`);
    }
  }

  async findById(id: string | Types.ObjectId): Promise<IImportDocument> {
    try {
      return await this.importsModel.findById(id).lean();
    } catch (error) {
      throw new error(`Error while quering import: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateQuery: UpdateQuery<IImport>
  ): Promise<IImportDocument> {
    try {
      return await this.importsModel
        .findByIdAndUpdate(id, updateQuery, {
          new: true
        })
        .lean();
    } catch (error) {
      throw new error(
        `Error while query for updating import: ${error.message}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.importsModel.findByIdAndDelete(id);
    } catch (error) {
      throw new error(`Error while query for delete import: ${error.message}`);
    }
  }
}

export default ImportsRepository;
