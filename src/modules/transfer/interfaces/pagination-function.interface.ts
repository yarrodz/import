export default interface IPaginationFunction {
  (offset: number, limitPerSecond: number, ...params: any[]): Promise<object[]>;
}
