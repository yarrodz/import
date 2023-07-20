import { Document, Types } from 'mongoose';

import { IRecord } from '../records/record.interface';

export interface IDataset {
  unit: Types.ObjectId | string;
  records: IRecord[];
  import?: Types.ObjectId | string;
  sourceDatasetId?: string;
}

export interface IDatasetDocument extends IDataset, Document {}
