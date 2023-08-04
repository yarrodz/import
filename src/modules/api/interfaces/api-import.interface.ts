import Request from './request.interface';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import RequestPaginationOptions from './request-pagination-options.interface';
import ImportField from '../../synchronizations/interfaces/import-field.interface';

export default interface ApiImport {
  id: number;
  request: Request;
  transferMethod: TransferMethod;
  paginationOptions?: RequestPaginationOptions;
  datasetsPath: string; // nested path to datasets inside response
  idPath: string; // nested path to id columns inside datasets
  fields: ImportField[];
}
