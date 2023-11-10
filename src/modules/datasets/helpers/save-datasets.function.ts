import { SaveDatasetsFunction } from "../../transfer-processes/interfaces/callbacks/save-datasets-callback.interface";
import { DatasetsRepository } from "../datasets.repository";
import { TransferDataset } from "../interfaces/transfer-dataset.interace";

export function saveDatasetsFunction(
  datasetsRepository: DatasetsRepository
): SaveDatasetsFunction {
  return async function (datasets: TransferDataset[]) {
    await datasetsRepository.bulkSave(datasets);
  }
}