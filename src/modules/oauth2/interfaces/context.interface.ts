import { ContextAction } from '../enums/context-action-enum';

export interface Context {
  action: ContextAction;
  connectionId: number;
  transferId?: number;
  transferProcessId?: number;
}
