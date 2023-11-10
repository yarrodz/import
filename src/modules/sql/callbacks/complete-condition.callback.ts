import { CompleteTransferConditionCallback } from "../../transfer-processes/interfaces/callbacks/complete-transfer-condition-callback.interface";
import { TransferParams } from "../../transfer-processes/interfaces/transfer-params.interace";

export const completeSqlTransferCondition: CompleteTransferConditionCallback = (
  params: TransferParams,
) => {
  const { process, lastFetchedDatasets } = params;
  const { offset, total, helper } = process;

  if (total !== undefined) {
    if (offset >= total) {
      return true;
    }
  }

  const { maxIdValue } = helper;

  if (lastFetchedDatasets.findIndex((dataset: any) => dataset.id === maxIdValue) !== -1) {
    return true;
  }

  return false;
}