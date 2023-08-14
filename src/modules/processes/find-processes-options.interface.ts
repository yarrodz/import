import { ProcessType } from './process.type.enum';

export default interface FindProcessesOptions {
  type?: ProcessType;
  unitId?: number;
  projectId?: number;
  connectionId?: number;
}
