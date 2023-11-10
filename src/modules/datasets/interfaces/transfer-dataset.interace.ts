import { TransferRecord } from './transfer-record.interface';

export interface TransferDataset {
  records: TransferRecord[];
  sourceId: string;
  importId: number;
  unitId: number;
}
