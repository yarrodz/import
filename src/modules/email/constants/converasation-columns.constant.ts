import { Column } from "../../transfers/interfaces/column.interface";

export const converationColumns: Column[] = [
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