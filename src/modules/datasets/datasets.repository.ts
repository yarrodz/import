import { Model, Types } from 'mongoose';

import { IDataset } from './dataset.interface';
import RecordsRepository from '../records/records.repository';

class DatasetsRepository {
  private datasetModel: Model<IDataset>;
  private recordsRepository: RecordsRepository;

  constructor(
    datasetModel: Model<IDataset>,
    recordsRepository: RecordsRepository
  ) {
    this.datasetModel = datasetModel;
    this.recordsRepository = recordsRepository;
  }

  async create(dataset: IDataset): Promise<void> {
    try {
      const createdDataset = await this.datasetModel.create({
        ...dataset,
        records: []
      });
      const createdRecords = await this.recordsRepository.createMany(
        dataset.records,
        createdDataset._id
      );
      await createdDataset.updateOne({ records: createdRecords });
    } catch (error) {
      throw new Error(`Error while creating the dataset: ${error.message}`);
    }
  }

  async update(id: string | Types.ObjectId, dataset: IDataset): Promise<void> {
    try {
      await this.recordsRepository.archiveRecords(id);
      const createdRecords = await this.recordsRepository.createMany(
        dataset.records,
        id
      );
      await this.datasetModel.findByIdAndUpdate(id, {
        records: createdRecords
      });
    } catch (error) {
      throw new Error(`Error while updating the dataset: ${error.message}`);
    }
  }

  async findByImportAndSourceDatasetIds(
    importId: string | Types.ObjectId,
    sourceDatasetId: string
  ) {
    try {
      return await this.datasetModel
        .findOne({
          import: importId,
          sourceDatasetId
        })
        .lean();
    } catch (error) {
      throw new Error(`Error while searching the dataset: ${error.message}`);
    }
  }
}

export default DatasetsRepository;
