import { FetchMessageObject } from 'imapflow';

class EmailColumnsHelper {
  find() {
    return [
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
        type: 'string'
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
        type: 'string'
    }
    ]
  }

  checkIdColumnUniqueness() {
    return true;
  }
}

export default EmailColumnsHelper;
