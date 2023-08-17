import { iFrameDbClient } from 'iFrame-ai';

import iFrameConnection from './iFrameConnection';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

class ConnectionsRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async getAll(select: any, sortings: any) {
    try {
      return await new iFrameConnection(this.client).query({
        select,
        sortings
      });
    } catch (error) {
      throw new error(`Error while query for getting connections: ${error}`);
    }
  }

  async get(id: number) {
    try {
      return await new iFrameConnection(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while query for getting a connection: ${error}`);
    }
  }

  async create(input: any) {
    try {
      return await new iFrameConnection(this.client)
        .insert(input)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while query for creating a connection: ${error}`);
    }
  }

  async update(input: any) {
    try {
      return await new iFrameConnection(this.client, input, input.id)
        .save()
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while query for creating a connection: ${error}`);
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameConnection(this.client).delete(id);
    } catch (error) {
      throw new error(`Error while query for deleting a connection: ${error}`);
    }
  }
}

export default ConnectionsRepository;
