import { Types } from 'mongoose';

import ApiConnectionSerice from '../api/api-connection.service';
import { ImportSource } from '../imports/enums/import-source.enum';
import { ConnectionState } from './enums/connection-state.enum';
import ImportsRepository from '../imports/imports.repository';
import SqlConnectionSerice from '../database/sql-connection.service';

class ConnectionService {
  private importsRepository: ImportsRepository;
  private sqlConnectionService: SqlConnectionSerice;
  private apiConnectionService: ApiConnectionSerice;

  constructor(
    importsRepository: ImportsRepository,
    sqlConnectionService: SqlConnectionSerice,
    apiConnectionService: ApiConnectionSerice
  ) {
    this.importsRepository = importsRepository;
    this.sqlConnectionService = sqlConnectionService;
    this.apiConnectionService = apiConnectionService;
  }

  public async connect(
    importId: string | Types.ObjectId
  ): Promise<ConnectionState> {
    const impt = await this.importsRepository.findById(importId);
    const { source } = impt;

    switch (source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB: {
        return await this.sqlConnectionService.connect(impt);
      }
      case ImportSource.API:
        return await this.apiConnectionService.connect(impt);
      default:
        throw new Error(
          `Error while connection: Unexpected import source: ${impt.source}`
        );
    }
  }
}

export default ConnectionService;
