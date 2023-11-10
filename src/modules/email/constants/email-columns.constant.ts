import { Column } from "../../transfers/interfaces/column.interface";

export const emailColumns: Column[] = [
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
