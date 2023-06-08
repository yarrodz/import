import { Pool, PoolConfig } from 'pg';

export class PostgresConnection {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async checkConnection(): Promise<void> {
    await this.pool.query('SELECT NOW()');
  }

  async queryRows(str: string): Promise<object[]> {
    const result = await this.pool.query(str);
    return result.rows;
  }

  async queryCount(str: string): Promise<number> {
    const result = await this.pool.query(str);
    return result.rows[0].count;
  }
}
