import Record from '../records/record.interface';
import Synchronization from '../synchronizations/interfaces/synchronization.interface';

export default interface Dataset {
  id: string;
  records: Record[];
  synchronization: Synchronization;
  sourceId?: string;
}
