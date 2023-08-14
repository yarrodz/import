import { ProcessType } from '../../processes/process.type.enum';
import { Source } from '../../imports/enums/source.enum';
import RetryOptions from '../../imports/interfaces/retry-options.interace';
import ApiConnection from './api-connection.interface';
import Request from './request.interface';

export default interface ApiExport {
  id?: number;

  name: string;
  idKey: string;

  type: ProcessType.EXPORT;
  source: Source.API;

  limitRequestsPerSecond: number;
  retryOptions: RetryOptions;

  request: Request;
  limit: number;

  connection?: ApiConnection;
}
