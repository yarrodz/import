import { Types } from 'mongoose';

import { CreateRecordInput } from '../../records/inputs/create-record.input';

export class CreateDatasetInput {
  readonly unit: Types.ObjectId;
  readonly imp: Types.ObjectId;
  readonly sourceDatasetId?: string;
  readonly records: Omit<CreateRecordInput, 'dataset'>[];
}
