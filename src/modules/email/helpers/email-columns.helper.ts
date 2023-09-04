import Column from '../../columns/column.interface';
import { EmailImportTarget } from '../enums/email-import-target.enum';

class EmailColumnsHelper {
  get(target: EmailImportTarget): Column[] {
    switch (target) {
      case EmailImportTarget.EMAILS: {
        return this.emailColumns;
      }
      case EmailImportTarget.CONVERSATIONS: {
        return this.converationColumns;
      }
      default: {
        throw new Error(`Unknown email import target: ${target}.`);
      }
    }
  }

  emailColumns: Column[] = [
    {
      name: 'messageId',
      type: 'string'
    },
    {
      name: 'from',
      type: 'string'
    },
    {
      name: 'to',
      type: 'json'
    },
    {
      name: 'date',
      type: 'Date'
    },
    {
      name: 'subject',
      type: 'string'
    },
    {
      name: 'text',
      type: 'string'
    },
    {
      name: 'html',
      type: 'html'
    },
    {
      name: 'threadId',
      type: 'string'
    }
  ];

  converationColumns: Column[] = [
    {
      name: 'threadId',
      type: 'string'
    },
    {
      name: 'conversation',
      type: 'json'
    },
    {
      name: 'date',
      type: 'date'
    }
  ];
}

export default EmailColumnsHelper;
