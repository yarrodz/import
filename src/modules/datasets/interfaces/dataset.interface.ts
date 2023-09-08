import { Record } from './record.interface';

export interface Dataset {
  records: Record[];
  sourceId?: string;
  importId?: number;
  unitId?: number;
}
