import { iFrameDbClient } from 'iFrame-ai';

import iFrameProcess from './iFrameProcess';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

class ProcessesRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async getAll(select: any, sortings: any) {
    try {
      return await new iFrameProcess(this.client).query(select, sortings);
    } catch (error) {
      throw new error(
        `Error while query for getting processes: ${error.message}`
      );
    }
  }

  async get(id: number) {
    try {
      return await new iFrameProcess(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for getting a process: ${error.message}`
      );
    }
  }

  async create(input: any) {
    try {
      const result = await new iFrameProcess(this.client)
        .insert(input, true, true)
        .then((result) => transformIFrameInstance(result));
        return result;
    } catch (error) {
      throw new error(
        `Error while query for creating a process: ${error.message}`
      );
    }
  }

  async update(input: any) {
    try {
      return await new iFrameProcess(this.client, input, input.id)
        .save(true, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(
        `Error while query for creating a process: ${error.message}`
      );
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameProcess(this.client).delete(id);
    } catch (error) {
      throw new error(
        `Error while query for deleting a process: ${error.message}`
      );
    }
  }
}

export default ProcessesRepository;
