export interface TransformDatasetsFunction {
  (datasets: object[]): object[] | Promise<object[]>;
}
