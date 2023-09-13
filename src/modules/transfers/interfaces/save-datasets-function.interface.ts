export interface SaveDatasetsFunction {
  (datasets: object[], ...params: any[]): object[] | Promise<object[] | void>;
}
