import { ContextAction } from '../enums/context-action-enum';

export interface Context {
  action: ContextAction;
  connectionId: number;
  importId?: number;
  exportId?: number;
  transferId?: number;
}
