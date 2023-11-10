import { ConnectionReference } from "./connection.reference.interface";

export interface Connection {
  id: number;
  
  name: string; 

  source: string;

  __: ConnectionReference
}
  