import mysql, { ConnectionConfig, Connection } from 'mysql';

export class MysqlConnection {
  private connection: Connection;

  constructor(config: ConnectionConfig | string) {
    this.connection = mysql.createConnection(config);
  }

  async connect() {
    return new Promise((resolve, reject) => {
        this.connection.connect((err) => {
          if (err) reject(err);
          resolve(true);
        });
    });
  }

  disconnect() {
    this.connection.end();
  }

  async query(str: string) {
    return new Promise((resolve, reject) => {
      this.connection.query(str, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
//   async queryRows(str: string): Promise<object[]> {
//     const result = await this.connection.query(str);
//     return result.rows;
//   }

//   async queryCount(str: string): Promise<number> {
//     const result = await this.pool.query(str);
//     return result.rows[0].count;
//   }
}
