import { CompleteTransferConditionCallback } from "./callbacks/complete-transfer-condition-callback.interface";
import { FetchDatasetsCallback } from "./callbacks/fetch-datasets-callback.interface";
import { SaveDatasetsCallback } from "./callbacks/save-datasets-callback.interface";
import { TransformDatasetsCallback } from "./callbacks/transform-datasets-callback.interface";

export interface TransferCallbacks {
  fetchDatasets: FetchDatasetsCallback;
  transformDatasets: TransformDatasetsCallback;
  saveDatasets: SaveDatasetsCallback;
  completeCondition: CompleteTransferConditionCallback;
}