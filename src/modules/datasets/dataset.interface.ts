import Record from '../records/record.interface';

export default interface Dataset {
  id: string;
  records: Record[];
  sourceId?: string;
}
