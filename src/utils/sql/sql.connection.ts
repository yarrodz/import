import { Sequelize, Options, QueryTypes } from 'sequelize';

export class SqlConnection {
  private connection: Sequelize;

  constructor(
    database: string,
    username: string,
    password: string,
    options: Options
  ) {
    this.connection = new Sequelize(database, username, password, options);
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

  async queryCount(str: string): Promise<number> {
    try {
      const result = await this.connection.query(str, {
        type: QueryTypes.SELECT
      });
      return Object.values(result[0])[0];
    } catch (error) {
      throw new Error(`Error while quering count: ${error.message}`);
    }
  }
}
