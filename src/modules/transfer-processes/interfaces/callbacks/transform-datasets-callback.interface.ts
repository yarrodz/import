export interface TransformDatasetsCallback {
  (datasets: object[], ...args: any[]):
    object[] | Promise<object[]>;
}
