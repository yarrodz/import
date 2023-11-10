import { Connection } from "../../connections/interfaces/connection.inteface";

export interface EmailConnection extends Connection {
  config: {
    auth: {
      user: string;
      password: string;
    };
    host: string;
    port: number;
  };
}
