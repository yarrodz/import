import { Types } from 'mongoose';

import SqlColumnsService from '../database/sql-columns.service';
import ApiColumnsService from '../api/api-columns.service';
import { ImportSource } from '../imports/enums/import-source.enum';
import { IColumn } from './interfaces/column.interface';
import ImportsRepository from '../imports/imports.repository';

class ColumnsService {
  private importsRepository: ImportsRepository;
  private sqlColumnsService: SqlColumnsService;
  private apiColumnsService: ApiColumnsService;

  constructor(
    importsRepository: ImportsRepository,
    sqlColumnsService: SqlColumnsService,
    apiColumnsService: ApiColumnsService
  ) {
    this.importsRepository = importsRepository;
    this.sqlColumnsService = sqlColumnsService;
    this.apiColumnsService = apiColumnsService;
  }

  public async find(
    importId: string | Types.ObjectId
  ): Promise<IColumn[] | string> {
    const impt = await this.importsRepository.findById(importId);
    const { source } = impt;

    switch (source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
        return await this.sqlColumnsService.find(impt);
      case ImportSource.API:
        return await this.apiColumnsService.find(impt);
      default:
        throw new Error(
          `Unexpected import source for receiving columns: ${impt.source}`
        );
    }
  }

  public async checkIdColumnUniqueness(
    importId: string | Types.ObjectId
  ): Promise<boolean> {
    const impt = await this.importsRepository.findById(importId);
    const { source } = impt;

    switch (source) {
      case ImportSource.MYSQL:
      case ImportSource.POSTGRESQL:
      case ImportSource.MICROSOFT_SQL_SERVER:
      case ImportSource.ORACLE:
      case ImportSource.MARIADB:
        return await this.sqlColumnsService.checkIdColumnUniqueness(impt);
      case ImportSource.API:
        return this.apiColumnsService.checkIdColumnUniqueness(impt);
      default:
        throw new Error(
          `Error while receiving columns. Unexpected import source: ${impt.source}`
        );
    }
  }
}

export default ColumnsService;
