import dotenv from 'dotenv';
import { iFrameDbClient } from 'iFrame-ai';

import iFrameProcess from './iFrameProcess';
import transformIFrameInstance from '../../utils/transform-iFrame-instance/transform-iFrame-instance';
import FindProcessesOptions from './find-processes-options.interface';
import dbClient from '../..';

dotenv.config();

class ProcessesRepository {
  private client: iFrameDbClient;

  constructor() {}

  async getAll(options: FindProcessesOptions) {
    try {
      this.client = dbClient;
      return await new iFrameProcess(this.client).getAll(options)
    } catch (error) {
      console.error('process getAll: ', error);
      throw new error(
        `Error while query for getting processes: ${error.message}`
      );
    }
  }

  async get(id: number) {
    try {
      this.client = dbClient;
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
      this.client = dbClient;
      const result = await new iFrameProcess(this.client)
        .insert(input, true, true)
        .then((result) => transformIFrameInstance(result));
        console.log('result: ' , result);
        return result;
    } catch (error) {
      console.error(error);
      throw new error(
        `Error while query for creating a process: ${error.message}`
      );
    }
  }

  async update(input: any) {
    try {
      this.client = dbClient;
      return await new iFrameProcess(this.client, input, input.id)
        .save(true, true, true)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      console.error(error);
      throw new error(
        `Error while query for creating a process: ${error.message}`
      );
    }
  }

  async delete(id: number) {
    this.client = dbClient;
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
