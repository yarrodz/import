import { Pagination } from "../pagination.type";

export interface FetchDatasetsCallbackResult {
  datasets: object[];
  cursor?: any;
}

export interface FetchDatasetsCallback {
  (pagination: Pagination):
    | FetchDatasetsCallbackResult
    | Promise<FetchDatasetsCallbackResult>;
}
