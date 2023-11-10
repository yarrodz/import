import { CompleteTransferConditionCallback } from "../../transfer-processes/interfaces/callbacks/complete-transfer-condition-callback.interface";
import { TransferParams } from "../../transfer-processes/interfaces/transfer-params.interace";

export const completeEmailTransferCondition: CompleteTransferConditionCallback =
  (params: TransferParams) => {
    const { process } = params;
    const { offset, total } = process;

    if (offset >= total) {
      return true;
    }

    return false;
  }