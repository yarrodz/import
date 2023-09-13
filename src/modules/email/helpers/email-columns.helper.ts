import { Column } from '../../imports/interfaces/column.interface';
import { EmailImportTarget } from '../enums/email-import-target.enum';

export class EmailColumnsHelper {
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
      name: 'inReplyTo',
      type: 'string'
    },
    {
      name: 'date',
      type: 'Date'
    },
    {
      name: 'from',
      type: 'json'
    },
    {
      name: 'to',
      type: 'json'
    },
    {
      name: 'cc',
      type: 'json'
    },
    {
      name: 'bcc',
      type: 'json'
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
      name: 'flags',
      type: 'json'
    },
    {
      name: 'labels',
      type: 'json'
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
