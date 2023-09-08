import { EmailAnsweredOption } from '../enums/filter-options/email-answered-option.enum';
import { EmailDeletedOption } from '../enums/filter-options/email-deleted-option.enum';
import { EmailDraftOption } from '../enums/filter-options/email-draft-option.enum';
import { EmailNewOption } from '../enums/filter-options/email-new-option.enum';
import { EmailSeenOption } from '../enums/filter-options/email-seen-option.enum';

export class EmailFilter {
  seen: EmailSeenOption;
  new: EmailNewOption;
  subject: string;
  since: string;
  before: string;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  answered: EmailAnsweredOption;
  deleted: EmailDeletedOption;
  draft: EmailDraftOption;
  withFlag: string;
  withoutFlag: string;
  threadId: string;
}
