import { Types } from 'mongoose';

import Record from './record.schema';
import { CreateRecordInput } from './inputs/create-record.input';

export async function createMany(createRecordInputs: CreateRecordInput[]) {
  return await Record.insertMany(createRecordInputs);
}

export async function archiveRecords(dataset: Types.ObjectId) {
    return await Record.updateMany({ dataset }, { archived: true });
}
