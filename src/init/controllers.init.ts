import { InitServicesResult } from './services.init';
import { OAuth2Controller } from '../modules/oauth2/oauth2.controller';
import { TransfersController } from '../modules/transfer-processes/transfer-processes.controller';
import { ImportsController } from '../modules/transfers/transfers.controller';
import { ConnectionsController } from '../modules/connections/connections.controller';
import { SchedulersController } from '../modules/scheduler/schedulers.controller';

export interface InitControllersResult {
  connectionsController: ConnectionsController;
  importsController: ImportsController;
  transfersController: TransfersController;
  schedulersController: SchedulersController;
  oAuth2Controller: OAuth2Controller;
}

export function initControllers(
  params: InitServicesResult
): InitControllersResult {
  const {
    connectionsService,
    importsService,
    transfersService,
    schedulersService,
    oAuth2Service
  } = params;

  const connectionsController = new ConnectionsController(connectionsService);
  const importsController = new ImportsController(importsService);
  const transfersController = new TransfersController(transfersService);
  const schedulersController = new SchedulersController(schedulersService);
  const oAuth2Controller = new OAuth2Controller(oAuth2Service);

  return {
    connectionsController,
    importsController,
    transfersController,
    schedulersController,
    oAuth2Controller
  };
}
