// import { FetchFunctionType } from '../enums/pagination-type.enum';
// import { CursorPaginationFunction } from '../interfaces/cursor-pagination-function.interface';
// import { CursorPagination } from '../interfaces/cursor-pagination.interface';
// import { FetchFunctionResult } from '../interfaces/fetch-function-result.interface';
// import { FetchFunction } from '../interfaces/fetch-datasets-function.interface';
// import { OffsetPaginationFunction } from '../interfaces/offset-pagination-function.interface';
// import { OffsetPagination } from '../interfaces/offset-pagination.interface';

// export class FetchDatasetsHelper {
//   public async fetchDatasets(
//     fetchFunction: FetchFunction,
//     limit: number,
//     offset?: number,
//     cursor?: any
//   ): Promise<FetchFunctionResult> {
//     const { params, type } = fetchFunction;

//     switch (type) {
//       case FetchFunctionType.OFFSET_PAGINATION: {
//         const fn = fetchFunction.fn as OffsetPaginationFunction;
//         const pagination: OffsetPagination = { offset, limit };
//         return await fn(pagination, ...params);
//       }
//       case FetchFunctionType.CURSOR_PAGINATION: {
//         const fn = fetchFunction.fn as CursorPaginationFunction;
//         const pagination: CursorPagination = { cursor, limit };
//         return await fn(pagination, ...params);
//       }
//       default: {
//         throw new Error(
//           `Error while transfer fetching datasets. Unknown fetch function type: ${type}.`
//         );
//       }
//     }
//   }
// }
