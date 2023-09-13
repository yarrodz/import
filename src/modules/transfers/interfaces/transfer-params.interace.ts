import { Process } from '../../processes/process.type';
import { Transfer } from './transfer.interface';
import { FetchDatasetsFunction } from './fetch-datasets-function.interface';
import { TransformDatasetsFunction } from './transform-datasets-function.interface';
import { SaveDatasetsFunction } from './save-datasets-function.interface';
import { TransferFinishCondition } from './transfer-finish-condition.interface';
import { PaginationType } from '../enums/pagination-type.enum';

export interface TransferParams {
  process: Process;
  transfer: Transfer;
  limitDatasetsPerStep: number;
  paginationType: PaginationType;
  useReferences: boolean;
  fetchFunction: FetchDatasetsFunction;
  transformFunction: TransformDatasetsFunction;
  saveFunction: SaveDatasetsFunction;
  //   finishConditionFunction: TransferFinishCondition;
}
