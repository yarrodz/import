import { ProcessType } from '../enums/process.type.enum';
import { ProcessSource } from '../enums/process-source.enum';
import { ProcessHooks } from './process-hooks.interface';
import { ProcessRetryOptions } from './process-retry-options.interace';
import { ProcessReference } from './process-reference.interface';

export interface BaseImport {
  id: number;
  name: string;

  type: ProcessType;
  source: ProcessSource;

  limitRequestsPerSecond: number;
  retryOptions: ProcessRetryOptions;

  hooks: ProcessHooks;

  __: ProcessReference;
}
