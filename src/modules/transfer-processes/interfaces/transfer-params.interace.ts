import { TransferProcess } from './transfer-process.interface';
import { PaginationType } from '../enums/pagination-type.enum';
import { TransferCallbacks } from './transfer-callbacks.interface';

export interface TransferParams {
  process: TransferProcess;
  socketRoom: string;
  paginationType: PaginationType;
  limitRequestsPerSecond: number;
  limitDatasetsPerRequest: number;
  callbacks: TransferCallbacks;
  lastFetchedDatasets: any;
  break?: boolean;
}