import { iFrameDbClient } from 'iFrame-ai';

import { iFrameScheduler } from './iFrameScheduler';
import { transformIFrameInstance } from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

export class SchedulersRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async query(select: any, sortings: any, firstOnly: boolean) {
    try {
      return await new iFrameScheduler(this.client).qq(
        select,
        sortings,
        firstOnly
      );
    } catch (error) {
      // console.error(error);
      throw new error(`Error while querying schedulers: ${error}`);
    }
  }

  async load(id: number) {
    try {
      return await new iFrameScheduler(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while loading a scheduler: ${error}`);
    }
  }

  async create(input: any) {
    try {
      return await new iFrameScheduler(this.client)
        .insert(input)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      // console.error(error);
      throw new error(`Error while creating a scheduler: ${error}`);
    }
  }

  async update(input: any) {
    try {
      return await new iFrameScheduler(this.client, input, input.id)
        .save()
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      throw new error(`Error while updating a scheduler: ${error}`);
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameScheduler(this.client).delete(id);
    } catch (error) {
      throw new error(`Error while deleting a scheduler: ${error}`);
    }
  }
}
