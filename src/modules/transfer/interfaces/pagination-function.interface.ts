export default interface IPaginationFunction {
  (offset: number, limit: number, ...params: any[]): Promise<object[]>;
}
