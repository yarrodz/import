import { iFrameDbClient, iFrameDataset } from 'iframe-ai';

import { TransferDataset } from './interfaces/transfer-dataset.interace';

export class DatasetsRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async bulkSave(datasets: TransferDataset[]): Promise<void> {
    try {
      await new iFrameDataset(this.client).bulkSave(datasets);
    } catch (error) {
      throw new Error(`Error while bulkSave datasets: ${error}`);
    }
  }
}
