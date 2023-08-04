import { SynchronizationContextAction } from '../enums/synchronization-context-action.enum';

export default interface SynchronizationContext {
  action: SynchronizationContextAction;
  synchronizationId: number;
  transferId?: number;
}
