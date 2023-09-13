import { Server as IO } from 'socket.io';

import { InitRepositoriesResult } from './repositories.init';
import { OAuth2Service } from '../modules/oauth2/oauth2.service';
import { SqlColumnsHelper } from '../modules/sql/helpers/sql-columns.helper';
import { TransferFailureHandler } from '../modules/transfers/helpers/transfer-failure-handler.helper';
import { OAuth2AuthUriHelper } from '../modules/oauth2/helpers/oauth2-auth-uri.helper';
import { ApiConnectionHelper } from '../modules/api/helpers/api-connection.helper';
import { TransfersService } from '../modules/transfers/transfers.service';
import { ImportsService } from '../modules/imports/imports.service';
import { ConnectionsService } from '../modules/connections/connections.service';
import { SqlImportHelper } from '../modules/sql/helpers/sql-import.helper';
import { ApiImportHelper } from '../modules/api/helpers/api-import.helper';
import { ApiColumnsHelper } from '../modules/api/helpers/api-columns.helper';
import { SqlImportService } from '../modules/sql/sql-import.service';
import { ApiImportService } from '../modules/api/api-import.service';
import { SqlTransferService } from '../modules/sql/sql-transfer.service';
import { ApiTransferService } from '../modules/api/api-transfer.service';
import { OAuth2RefreshTokenHelper } from '../modules/oauth2/helpers/oath2-refresh-token.helper';
import { PendingTransfersReloader } from '../modules/transfers/helpers/transfers-reloader.helper';
import { EmailTransferService } from '../modules/email/email-transfer.service';
import { EmailColumnsHelper } from '../modules/email/helpers/email-columns.helper';
import { EmailImportHelper } from '../modules/email/helpers/email-import.helper';
import { EmailImportService } from '../modules/email/email-import.service';
import { SqlTransferHelper } from '../modules/sql/helpers/sql-transfer.helper';
import { ApiTransferHelper } from '../modules/api/helpers/api-transfer-helper';
import { EmailTransferHelper } from '../modules/email/helpers/email-transfer-helper';
import { SqlConnectionHelper } from '../modules/sql/helpers/sql-connection.helper';
import { EmailConnectionHelper } from '../modules/email/helpers/email-connection.helper';
import { SqlConnectionService } from '../modules/sql/sql-connection.service';
import { ApiConnectionService } from '../modules/api/api-conection.service';
import { EmailConnectionService } from '../modules/email/email-connection.service';
import { SchedulersService } from '../modules/scheduler/schedulers.service';
import { SchedulersCron } from '../modules/scheduler/schedulers.cron';
import { TransferHelper } from '../modules/transfers/helpers/transfer.helper';
import { TransformDatasetsHelper } from '../modules/datasets/helpers/transform-datasets.helper';

export interface InitServicesParams extends InitRepositoriesResult {
  io: IO;
  clientUri: string;
  oAuth2RedirectUri: string;
}

export interface InitServicesResult {
  connectionsService: ConnectionsService;
  importsService: ImportsService;
  transfersService: TransfersService;
  schedulersService: SchedulersService;
  oAuth2Service: OAuth2Service;
  pendingTransfersReloader: PendingTransfersReloader;
  schedulersCron: SchedulersCron;
}

export function initServices(params: InitServicesParams): InitServicesResult {
  const {
    io,
    clientUri,
    oAuth2RedirectUri,
    datasetsRepository,
    connectionsRepository,
    processesRepository,
    transfersRepository,
    schedulersRepository
  } = params;

  const oAuth2RefreshTokenHelper = new OAuth2RefreshTokenHelper(
    connectionsRepository
  );
  const oAuth2AuthUriHelper = new OAuth2AuthUriHelper(oAuth2RedirectUri);
  const oAuth2Service = new OAuth2Service(
    oAuth2RedirectUri,
    clientUri,
    connectionsRepository
  );

  const transferHelper = new TransferHelper(io, transfersRepository);

  const transferFailureHandler = new TransferFailureHandler(
    io,
    transfersRepository
  );
  

  const sqlConnectionHelper = new SqlConnectionHelper();
  const apiConnectionHelper = new ApiConnectionHelper(
    oAuth2RefreshTokenHelper,
    processesRepository
  );
  const emailConnectionHelper = new EmailConnectionHelper();

  const sqlColumnsHelper = new SqlColumnsHelper();
  const apiColumnsHelper = new ApiColumnsHelper();
  const emailColumnsHelper = new EmailColumnsHelper();

  const sqlTransferHelper = new SqlTransferHelper(transfersRepository);
  const apiTranserHelper = new ApiTransferHelper(transfersRepository);
  const emailTransferHelper = new EmailTransferHelper(transfersRepository);

  const apiImportHelper = new ApiImportHelper(
    apiTranserHelper,
    apiConnectionHelper,
    transferFailureHandler,
    transfersRepository
  );

  const transformDatasetsHelper = new TransformDatasetsHelper();

  const emailImportHelper = new EmailImportHelper(
    emailTransferHelper,
    transferHelper,
    transferFailureHandler,
    transformDatasetsHelper,
    transfersRepository,
    datasetsRepository
  );


  const sqlImportHelper = new SqlImportHelper(
    sqlTransferHelper,
    transferHelper,
    transferFailureHandler,
    transformDatasetsHelper,
    transfersRepository,
    datasetsRepository
  );

  const sqlImportService = new SqlImportService(
    sqlColumnsHelper,
    sqlImportHelper,
    sqlTransferHelper,
    processesRepository
  );
  const apiImportService = new ApiImportService(
    apiConnectionHelper,
    apiColumnsHelper,
    apiImportHelper,
    apiTranserHelper,
    oAuth2AuthUriHelper,
    processesRepository
  );
  const emailImportService = new EmailImportService(
    emailColumnsHelper,
    emailImportHelper,
    emailTransferHelper,
    processesRepository
  );

  const sqlTransferService = new SqlTransferService(sqlImportHelper);
  const apiTransferService = new ApiTransferService(
    apiConnectionHelper,
    apiImportHelper,
    oAuth2AuthUriHelper,
    processesRepository,
    transfersRepository
  );
  const emailTransferService = new EmailTransferService(emailImportHelper);

  const sqlConnectionService = new SqlConnectionService(
    sqlConnectionHelper,
    connectionsRepository
  );
  const apiConnectionService = new ApiConnectionService(connectionsRepository);
  const emailConnectionService = new EmailConnectionService(
    emailConnectionHelper,
    connectionsRepository
  );

  const connectionsService = new ConnectionsService(
    sqlConnectionService,
    apiConnectionService,
    emailConnectionService,
    connectionsRepository,
    processesRepository
  );
  const importsService = new ImportsService(
    sqlImportService,
    apiImportService,
    emailImportService,
    processesRepository,
    transfersRepository
  );
  const transfersService = new TransfersService(
    io,
    sqlTransferService,
    apiTransferService,
    emailTransferService,
    transfersRepository,
    processesRepository
  );

  const schedulersService = new SchedulersService(schedulersRepository);

  const pendingTransfersReloader = new PendingTransfersReloader(
    sqlImportHelper,
    apiImportHelper,
    emailImportHelper,
    transfersRepository,
    processesRepository
  );

  const schedulersCron = new SchedulersCron(
    sqlImportHelper,
    apiImportHelper,
    emailImportHelper,
    schedulersRepository,
    transfersRepository,
    processesRepository
  );

  return {
    connectionsService,
    importsService,
    transfersService,
    schedulersService,
    oAuth2Service,
    pendingTransfersReloader,
    schedulersCron
  };
}
