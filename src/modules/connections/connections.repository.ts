import { iFrameDbClient } from 'iFrame-ai';

import iFrameConnection from './iFrameConnection';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';
import { Source } from '../imports/enums/source.enum';

class ConnectionsRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async getAll(select: any, sortings: any) {
    try {
      return await new iFrameConnection(this.client).query({
        select,
        sortings,
      }
      );
    } catch (error) {
      throw new error(
        `Error while query for getting connections: ${error.message}`
      );
    }
  }

  async get(id: number) {
    try {
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
      return await new iFrameConnection(this.client)
        .insert(input, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for creating a connection: ${error.message}`
      );
    }
  }

  async update(input: any) {
    try {
      return await new iFrameConnection(this.client, input, input.id)
        .save(true, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for creating a connection: ${error.message}`
      );
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameConnection(this.client).delete(id);
    } catch (error) {
      throw new error(
        `Error while query for deleting a connection: ${error.message}`
      );
    }
  }
}

export default ConnectionsRepository;
