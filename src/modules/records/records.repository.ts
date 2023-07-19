import { Model, Types } from 'mongoose';

import { IRecord, IRecordDocument } from './record.interface';

class RecordsRepository {
  private recordModel: Model<IRecord>;

  constructor(recordModel: Model<IRecord>) {
    this.recordModel = recordModel;
  }

  async createMany(
    records: Partial<IRecord>[],
    datasetId: string | Types.ObjectId
  ): Promise<IRecordDocument[]> {
    try {
      const recordsToCreate = records.map((record) => {
        return {
          ...record,
          dataset: datasetId
        };
      });
      return await this.recordModel.insertMany(recordsToCreate) as IRecordDocument[];
    } catch (error) {
      throw new Error(`Error while inserting records: ${error.message}`);
    }
  }

  async archiveRecords(datasetId: string | Types.ObjectId): Promise<void> {
    try {
      await this.recordModel.updateMany(
        { dataset: datasetId },
        { archived: true }
      );
    } catch (error) {
      throw new Error(`Error while archiving records: ${error.message}`);
    }
  }
}

export default RecordsRepository;
