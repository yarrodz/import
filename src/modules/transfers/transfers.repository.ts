import { iFrameDbClient } from 'iFrame-ai';

import { iFrameTransfer } from './iFrameTransfer';
import { transformIFrameInstance } from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

export class TransfersRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async query(select: any, sortings: any, firstOnly: boolean) {
    try {
      return await new iFrameTransfer(this.client).query(
        select,
        sortings,
        firstOnly
      );
    } catch (error) {
      throw new error(`Error while querying processes: ${error}`);
    }
  }

  async load(id: number) {
    try {
      return await new iFrameTransfer(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while loading a process: ${error}`);
    }
  }

  async create(input: any) {
    try {
      const result = await new iFrameTransfer(this.client)
        .insert(input)
        .then((result) => transformIFrameInstance(result));
      return result;
    } catch (error) {
      throw new error(`Error while creating a process: ${error}`);
    }
  }

  async update(input: any) {
    try {
      return await new iFrameTransfer(this.client, input, input.id)
        .save()
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while updating a process: ${error}`);
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameTransfer(this.client).delete(id);
    } catch (error) {
      throw new error(`Error while deleting a process: ${error}`);
    }
  }
}
