import Record from '../records/record.interface';

export default interface Dataset {
  records: Record[];
  sourceId?: string;
  importId?: number;
  unitId?: number;
}
