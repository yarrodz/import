import { TransferParams } from "../transfer-params.interace";

export interface CompleteTransferConditionCallback {
  (params: TransferParams): boolean | Promise<boolean>;
}