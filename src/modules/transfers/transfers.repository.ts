import { iFrameDbClient } from 'iFrame-ai';

import iFrameTransfer from './iFrameTransfer';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

class TransfersRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async getAll(select: any, sortings: any) {
    try {
      return await new iFrameTransfer(this.client).query(
        select,
        sortings,
      );
    } catch (error) {
      throw new error(
        `Error while query for getting transfers: ${error.message}`
      );
    }
  }

  async get(id: number) {
    try {
      return await new iFrameTransfer(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for getting a transfer: ${error.message}`
      );
    }
  }

  async create(input: any) {
    try {
      return await new iFrameTransfer(this.client)
        .insert(input, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for creating a transfer: ${error.message}`
      );
    }
  }

  async update(input: any) {
    try {
      return await new iFrameTransfer(this.client, input, input.id)
        .save(true, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for creating a transfer: ${error.message}`
      );
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameTransfer(this.client).delete(id);
    } catch (error) {
      throw new error(
        `Error while query for deleting a transfer: ${error.message}`
      );
    }
  }
}

export default TransfersRepository;
