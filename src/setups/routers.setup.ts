import OAuth2Controller from '../modules/oauth2/oauth2.controller';
import OAuth2Router from '../modules/oauth2/oauth2.router';
import SynchronizationsController from '../modules/synchronizations/synchronizations.controller';
import SynchronizationsRouter from '../modules/synchronizations/synchronizations.router';
import TransfersController from '../modules/transfers/transfers.controller';
import TransfersRouter from '../modules/transfers/transfers.router';

export default function setupRouters(
  synchronizationsController: SynchronizationsController,
  transfersController: TransfersController,
  oAuth2Controller: OAuth2Controller
): {
  synchronizationsRouter: SynchronizationsRouter;
  transfersRouter: TransfersRouter;
  oAuth2Router: OAuth2Router;
} {
  const synchronizationsRouter = new SynchronizationsRouter(
    synchronizationsController
  );
  const transfersRouter = new TransfersRouter(transfersController);
  const oAuth2Router = new OAuth2Router(oAuth2Controller);

  return {
    synchronizationsRouter,
    transfersRouter,
    oAuth2Router
  };
}
