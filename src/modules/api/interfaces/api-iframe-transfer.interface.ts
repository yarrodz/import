import { Request } from './request.interface';
import { TransferMethod } from '../../transfer-processes/enums/transfer-method.enum';
import { RequestPaginationOptions } from './request-pagination-options.interface';
import { Transfer } from '../../transfers/interfaces/transfer.interface';

export interface ApiIframeTransfer extends Transfer {
  limitRequestsPerSecond: number;

  request: Request;
  transferMethod: TransferMethod;
  paginationOptions?: RequestPaginationOptions;

  datasetsPath: string; // nested path to datasets inside response
  idPath: string; // nested path to id columns inside datasets
}
