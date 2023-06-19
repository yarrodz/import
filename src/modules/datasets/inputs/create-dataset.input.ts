import { Types } from 'mongoose';

import { CreateRecordInput } from '../../records/inputs/create-record.input';

export class CreateDatasetInput {
  readonly unit: Types.ObjectId | string;
  readonly impt: Types.ObjectId | string;
  readonly sourceDatasetId?: string;
  readonly records: Omit<CreateRecordInput, 'dataset'>[];
}
