import { iFrameDbClient, iFrameDataset } from 'iframe-ai';

import Dataset from './dataset.interface';

class DatasetsRepository {
  private client: iFrameDbClient;

  constructor(client: iFrameDbClient) {
    this.client = client;
  }

  async bulkSave(datasets: Dataset[]): Promise<void> {
    try {
      await new iFrameDataset(this.client).bulkSave(datasets);
    } catch (error) {
      throw new Error(`Error while bulkSave datasets: ${error}`);
    }
  }
}

export default DatasetsRepository;
