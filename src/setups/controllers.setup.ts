import OAuth2Service from '../modules/oauth2/oauth2.service';
import SynchronizationsService from '../modules/synchronizations/synchronizations.service';
import SynchronizationsController from '../modules/synchronizations/synchronizations.controller';
import OAuth2Controller from '../modules/oauth2/oauth2.controller';
import TransfersService from '../modules/transfers/transfers.service';
import TransfersController from '../modules/transfers/transfers.controller';

export default function setupControllers(
  synchronizationsService: SynchronizationsService,
  transfersService: TransfersService,
  oAuth2Service: OAuth2Service
): {
  synchronizationsController: SynchronizationsController;
  transfersController: TransfersController;
  oAuth2Controller: OAuth2Controller;
} {
  const synchronizationsController = new SynchronizationsController(
    synchronizationsService
  );
  const transfersController = new TransfersController(transfersService);
  const oAuth2Controller = new OAuth2Controller(oAuth2Service);

  return {
    synchronizationsController,
    transfersController,
    oAuth2Controller
  };
}
