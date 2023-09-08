import { iFrameDbClient } from 'iFrame-ai';

import { iFrameConnection } from './iFrameConnection';
import { transformIFrameInstance } from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

export class ConnectionsRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async query(select: any, sortings: any, firstOnly: boolean) {
    try {
      return await new iFrameConnection(this.client).query(
        select,
        sortings,
        firstOnly
      );
    } catch (error) {
      throw new error(`Error while querying connections: ${error}`);
    }
  }

  async load(id: number) {
    try {
      return await new iFrameConnection(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while loading a connection: ${error}`);
    }
  }

  async create(input: any) {
    try {
      return await new iFrameConnection(this.client)
        .insert(input)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while creating a connection: ${error}`);
    }
  }

  async update(input: any) {
    try {
      return await new iFrameConnection(this.client, input, input.id)
        .save()
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while updating a connection: ${error}`);
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameConnection(this.client).delete(id);
    } catch (error) {
      throw new error(`Error while deleting a connection: ${error}`);
    }
  }
}
