import { Process } from '../../processes/process.type';
import { TransferFinishConditionPlacement } from '../enums/transfer-finish-condition-placement.enum';
import { Transfer } from './transfer.interface';

export interface TransferFinishConditionFunctionParams {
  process: Process;
  transfer: Transfer;
  datasets?: object[];
}

export interface TransferFinishCondition {
  placement: TransferFinishConditionPlacement;
  fn: (params: TransferFinishConditionFunctionParams) => boolean;
}
