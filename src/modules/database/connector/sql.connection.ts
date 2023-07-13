import { Sequelize, Options, QueryTypes } from 'sequelize';

export class SqlConnector {
  private connection: Sequelize;

  constructor(options: Options) {
    this.connection = new Sequelize({ ...options, logging: false });
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
