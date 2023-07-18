import { Types } from 'mongoose';

import { ImportContextAction } from '../enums/import-context-action.enum';

export default interface IImportContext {
  action: ImportContextAction;
  importId: Types.ObjectId | string;
  processId?: Types.ObjectId | string;
}
