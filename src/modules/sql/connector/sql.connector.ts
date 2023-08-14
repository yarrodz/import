import { Sequelize, QueryTypes, Dialect as SequelizeDialect } from 'sequelize';
import { SqlSequelizeDialectMap } from './sql-sequelize-dialect.map';
import { SqlConnectionConfig } from '../interfaces/sql.connection.interface';

export class SqlConnector {
  private connection: Sequelize;

  constructor(options: SqlConnectionConfig) {
    const dialect = SqlSequelizeDialectMap[options.dialect] as SequelizeDialect;
    this.connection = new Sequelize({ ...options, dialect, logging: false });
  }

  async connect(): Promise<void> {
    try {
      await this.connection.authenticate();
    } catch (error) {
      throw new Error(`Error while connecting to database: ${error.message}`);
    }
  }

  disconnect() {
    this.connection.close();
  }

  async queryRows(str: string): Promise<object[]> {
    try {
      const result = await this.connection.query(str, {
        type: QueryTypes.SELECT
      });
      return result;
    } catch (error) {
      throw new Error(`Error while quering data: ${error.message}`);
    }
  }

  async queryResult(str: string): Promise<any> {
    try {
      const result = await this.connection.query(str, {
        type: QueryTypes.SELECT
      });
      return Object.values(result[0])[0];
    } catch (error) {
      throw new Error(`Error while quering result: ${error.message}`);
    }
  }
}
