import OAuth2Service from '../modules/oauth2/oauth2.service';
import OAuth2Controller from '../modules/oauth2/oauth2.controller';
import TransfersService from '../modules/transfers/transfers.service';
import TransfersController from '../modules/transfers/transfers.controller';
import ImportsService from '../modules/imports/imports.service';
import ImportsController from '../modules/imports/imports.controller';
import ConnectionsController from '../modules/connections/connections.controller';

export default function setupControllers(
  importsService: ImportsService,
  transfersService: TransfersService,
  oAuth2Service: OAuth2Service
): {
  importsController: ImportsController;
  transfersController: TransfersController;
  oAuth2Controller: OAuth2Controller;
} {
  const importsController = new ImportsController(importsService);
  const transfersController = new TransfersController(transfersService);
  const oAuth2Controller = new OAuth2Controller(oAuth2Service);

  return {
    importsController,
    transfersController,
    oAuth2Controller
  };
}
