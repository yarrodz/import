import { InitServicesResult } from './services.init';
import OAuth2Controller from '../modules/oauth2/oauth2.controller';
import TransfersController from '../modules/transfers/transfers.controller';
import ImportsController from '../modules/imports/imports.controller';
import ConnectionsController from '../modules/connections/connections.controller';

export interface InitControllersResult {
  connectionsController: ConnectionsController,
  importsController: ImportsController,
  transfersController: TransfersController,
  oAuth2Controller: OAuth2Controller
}

export default function initControllers(params: InitServicesResult): InitControllersResult {
  const {
    connectionsService,
    importsService,
    transfersService,
    oAuth2Service,
  } = params;

  const connectionsController = new ConnectionsController(connectionsService)
  const importsController = new ImportsController(importsService);
  const transfersController = new TransfersController(transfersService);
  const oAuth2Controller = new OAuth2Controller(oAuth2Service);

  return {
    connectionsController,
    importsController,
    transfersController,
    oAuth2Controller
  };
}
