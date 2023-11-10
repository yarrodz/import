import { OffsetPagination } from '../../transfer-processes/interfaces/offset-pagination.interface';

export class EmailUidRangeHelper {
  static createStringRange(
    pagination: OffsetPagination,
    uids: string[]
  ): string {
    const { offset, limit } = pagination;
    return uids[offset] + ':' + uids[offset+limit];
  }

  static createArrayRange(
    pagination: OffsetPagination,
    uids: string[]
  ): string[] {
    const { offset, limit } = pagination;
    return uids.slice(offset, offset + limit);
  }
}
