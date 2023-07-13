import { Request } from 'express';

import { IImport } from '../imports/import.schema';
import { ImportSource } from '../imports/enums/import-source.enum';
import IOAuth2CallbackContext from '../imports/interfaces/import-context.interface';
import ApiConnectionSerice from '../api/api-connection.service';
import IConnectionResult from './interfaces/connection-result.interface';
import { ConnectionState } from './enums/connection-state.enum';

class ConnectionService {
  private apiConnectionService: ApiConnectionSerice;

  constructor(apiConnectionService: ApiConnectionSerice) {
    this.apiConnectionService = apiConnectionService;
  }

  public async connect(
    req: Request,
    impt: Omit<IImport, 'fields'>,
    context: IOAuth2CallbackContext
  ): Promise<IConnectionResult> {
    switch (impt.source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB: {
        const connectionResult: IConnectionResult = {
          state: ConnectionState.CONNECTED
        };
        return connectionResult;
      }
      case ImportSource.API:
        return await this.apiConnectionService.connect(req, impt, context);
      default:
        throw new Error(
          `Error while connection: Unexpected import source: ${impt.source}`
        );
    }
  }
}

export default ConnectionService;
