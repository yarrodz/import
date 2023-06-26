import mongoose, { Document, Schema, Types } from 'mongoose';

import { IRecord } from '../records/record.interface';

export interface IDataset {
  unit: Types.ObjectId | string;
  records: Omit<IRecord, 'dataset'>[];
  import?: Types.ObjectId | string;
  sourceDatasetId?: string;
}

export interface IDatasetDocument extends IDataset, Document {}
