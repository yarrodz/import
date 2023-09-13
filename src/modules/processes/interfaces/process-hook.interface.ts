export interface ProcessHook {
  (datasets: object[]): Promise<object[]>;
}
