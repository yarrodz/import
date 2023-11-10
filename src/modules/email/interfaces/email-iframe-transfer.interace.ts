import { Transfer } from '../../transfers/interfaces/transfer.interface';
import { EmailImportTarget } from '../enums/email-import-target.enum';
import { EmailFilter } from './email-filter.interface';

export interface EmailIframeTransfer extends Transfer {
  mailbox: string;
  filter: Partial<EmailFilter>;
  target: EmailImportTarget;

  limitRequestsPerSecond: number;
  limitDatasetsPerRequest: number;
}
