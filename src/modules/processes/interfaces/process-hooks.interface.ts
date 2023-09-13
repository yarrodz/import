import { ProcessHook } from './process-hook.interface';

export interface ProcessHooks {
  afterFetch: ProcessHook;
  afterTransform: ProcessHook;
  afterSave: ProcessHook;
}
