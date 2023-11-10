import { iFrameDbClient } from 'iFrame-ai';

import { iFrameTransferProcess } from './iFrameTransferProcess';
import { transformIFrameInstance } from '../../utils/transform-iFrame-instance/transform-iFrame-instance';

export class TransferProcessesRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async query(select: any, sortings: any, firstOnly: boolean) {
    try {
      return await new iFrameTransferProcess(this.client).qq(
        select,
        sortings,
        firstOnly
      );
    } catch (error) {
      // console.error(error);
      throw new error(`Error while querying transfers: ${error}`);
    }
  }

  async load(id: number) {
    try {
      return await new iFrameTransferProcess(this.client)
        .load(id)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      // console.error('Load: ', error);
      throw new error(`Error while loading a transfer: ${error}`);
    }
  }

  async create(input: any) {
    try {
      return await new iFrameTransferProcess(this.client)
        .insert(input)
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      // console.error('Create: ', error);
      throw new error(`Error while creating a transfer: ${error}`);
    }
  }

  async update(input: any) {
    try {
      return await new iFrameTransferProcess(this.client, input, input.id)
        .save()
        .then((result) => transformIFrameInstance(result));
    } catch (error) {
      // console.error('Update: ', error);
      throw new error(`Error while updating a transfer: ${error}`);
    }
  }

  async delete(id: number) {
    try {
      return await new iFrameTransferProcess(this.client).delete(id);
    } catch (error) {
      throw new error(`Error while deleting a transfer: ${error}`);
    }
  }
}
