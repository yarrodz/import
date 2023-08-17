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
      throw new error(`Error while query for getting processes: ${error}`);
    }
  }

  async get(id: number) {
    try {
      return await new iFrameProcess(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      console.error(error);
      throw new error(`Error while query for getting a process: ${error}`);
    }
  }

  async create(input: any) {
    try {
      const result = await new iFrameProcess(this.client)
        .insert(input)
        .then((result) => transformIFrameInstance(result));
      return result;
    } catch (error) {
      throw new error(`Error while query for creating a process: ${error}`);
    }
  }

  async update(input: any) {
    try {
      return await new iFrameProcess(this.client, input, input.id)
        .save()
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      console.error(error);
      throw new error(`Error while query for creating a process: ${error}`);
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameProcess(this.client).delete(id);
    } catch (error) {
      throw new error(`Error while query for deleting a process: ${error}`);
    }
  }
}

export default ProcessesRepository;
