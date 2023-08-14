import Transfer from './transfer.interface';

export default interface TransferInput {
  synchronizationId?: number;
  unitId?: number;
  projectId?: number;
  transfer: Partial<Transfer>;
}
