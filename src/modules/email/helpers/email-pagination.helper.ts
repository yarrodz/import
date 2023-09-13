import { EmailPagination } from '../interfaces/email-pagination.interface';

export class EmailPaginationHelper {
  static createRange(pagination: EmailPagination): string {
    const { offset, limit } = pagination;

    if (typeof offset === 'number' && typeof limit === 'number') {
      return `${offset + 1}:${offset + limit}`;
    } else if (typeof offset === 'number' && limit === '*') {
      return `${offset + 1}:${limit}`;
    } else {
      throw new Error(
        `Error while searching emails. Invalid pagination: ${pagination}.`
      );
    }
  }

  static createUidRange(pagination: EmailPagination, uids: number[]): string {
    const { offset, limit } = pagination;

    if (typeof offset === 'number' && typeof limit === 'number') {
      return uids.slice(offset, offset + limit).join(',');
    } else if (typeof offset === 'number' && limit === '*') {
      //     return `${offset + 1}:${limit}`;
    } else {
      throw new Error(
        `Error while searching emails. Invalid pagination: ${pagination}.`
      );
    }
  }
}
