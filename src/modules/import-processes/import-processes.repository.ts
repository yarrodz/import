import { Model, Types, UpdateQuery } from 'mongoose';

import {
  IImportProcess,
  IImportProcessDocument
} from './import-process.schema';
import { CreateImportProcessInput } from './inputs/create-imort-process.input';
import { ImportStatus } from './enums/import-status.enum';

class ImportProcessesRepository {
  private importProcessModel: Model<IImportProcess>;

  constructor(importProcessModel: Model<IImportProcess>) {
    this.importProcessModel = importProcessModel;
  }

  async create(
    input: CreateImportProcessInput
  ): Promise<IImportProcessDocument> {
    try {
      return await this.importProcessModel.create(input);
    } catch (error) {
      throw new error(
        `Error while query for creating import: ${error.message}`
      );
    }
  }

  async findAll(unit: string): Promise<IImportProcessDocument[]> {
    try {
      return await this.importProcessModel.find({ unit }).lean();
    } catch (error) {
      throw new error(`Error while quering import processes: ${error.message}`);
    }
  }

  async findById(id: string | Types.ObjectId): Promise<IImportProcessDocument> {
    try {
      return await this.importProcessModel.findById(id).lean();
    } catch (error) {
      throw new error(`Error while quering import process: ${error.message}`);
    }
  }

  async findPendingByUnit(unit: string): Promise<IImportProcessDocument> {
    return await this.importProcessModel.findOne({
      unit,
      status: ImportStatus.PENDING
    });
  }

  async update(
    id: string,
    updateQuery: UpdateQuery<IImportProcess>
  ): Promise<IImportProcessDocument> {
    try {
      return await this.importProcessModel.findByIdAndUpdate(id, updateQuery, {
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
      await this.importProcessModel.findByIdAndDelete(id);
    } catch (error) {
      throw new error(
        `Error while query for delete import process: ${error.message}`
      );
    }
  }
}

export default ImportProcessesRepository;
