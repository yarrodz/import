import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRecord {
  value: any;
  archived: boolean;
  feature: Types.ObjectId;
  dataset: Types.ObjectId;
}

export interface IRecordDocument extends IRecord, Document {}
