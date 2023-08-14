import dotenv from 'dotenv';
import { iFrameDbClient } from 'iFrame-ai';

import iFrameConnection from './iFrameConnection';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';
import dbClient from '../..';

dotenv.config();

class ConnectionsRepository {
  private client: iFrameDbClient;

  constructor() {
    // this.client = iFrameDbClient.getInstance(process.env.IFRAME_SECRET_KEY);
    // this.client = dbClient;
    // console.log('repository constructor this.client: ', this.client);
  }

  // async getAll(unitId: number, connectionId: number) {
  //   try {
  //     return await new iFrameConnection(this.client).getAll(
  //       unitId,
  //       connectionId
  //     );
  //   } catch (error) {
  //     throw new error(
  //       `Error while query for getting connections: ${error.message}`
  //     );
  //   }
  // }

  async get(id: number) {
    try {
      this.client = dbClient;
      return await new iFrameConnection(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for getting a connection: ${error.message}`
      );
    }
  }

  async create(input: any) {
    try {
      this.client = dbClient;
      // this.client = iFrameDbClient.getInstance(process.env.IFRAME_SECRET_KEY);
      console.log('repository create this.client: ', this.client);
      return await new iFrameConnection(this.client)
        .insert(input, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      // console.error('create connection Error: ', error);
      console.error(error);
      throw new error(
        `Error while query for creating a connection: ${error.message}`
      );
    }
  }

  async update(input: any) {
    try {
      this.client = dbClient;
      return await new iFrameConnection(this.client, input, input.id)
        .save(true, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      console.error(error);
      throw new error(
        `Error while query for creating a connection: ${error.message}`
      );
    }
  }

  async delete(id: number) {
    try {
      this.client = dbClient;
      return await new iFrameConnection(this.client).delete(id);
    } catch (error) {
      throw new error(
        `Error while query for deleting a connection: ${error.message}`
      );
    }
  }
}

export default ConnectionsRepository;
