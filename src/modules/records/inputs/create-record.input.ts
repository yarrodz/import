import { Types } from 'mongoose';

export class CreateRecordInput {
  readonly value: any;
  readonly feature: Types.ObjectId;
  readonly dataset: Types.ObjectId;
}
