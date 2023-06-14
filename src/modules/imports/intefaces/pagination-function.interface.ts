export interface IPaginationFunction {
  (offset: number, limit: number, ...params: any[]): Promise<object[]>;
}
