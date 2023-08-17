import { iFrameDbClient } from 'iFrame-ai';

import ConnectionsRepository from '../modules/connections/connections.repository';
import DatasetsRepository from '../modules/datasets/datasets.repository';
import ProcessesRepository from '../modules/processes/process.repository';
import TransfersRepository from '../modules/transfers/transfers.repository';

export interface InitRepositoriesResult {
  datasetsRepository: DatasetsRepository;
  connectionsRepository: ConnectionsRepository;
  processesRepository: ProcessesRepository;
  transfersRepository: TransfersRepository;
}

export default function initRepositories(
  dbClient: iFrameDbClient
): InitRepositoriesResult {
  const datasetsRepository = new DatasetsRepository(dbClient);
  const connectionsRepository = new ConnectionsRepository(dbClient);
  const processesRepository = new ProcessesRepository(dbClient);
  const transfersRepository = new TransfersRepository(dbClient);

  return {
    datasetsRepository,
    connectionsRepository,
    processesRepository,
    transfersRepository
  };
}
