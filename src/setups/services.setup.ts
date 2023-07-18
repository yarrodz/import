import { Server as IO } from 'socket.io';

import ColumnsService from '../modules/columns/columns.service';
import DatasetsRepository from '../modules/datasets/datasets.repository';
import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import ImportProcessesService from '../modules/import-processes/import-processes.service';
import ImportsRepository from '../modules/imports/imports.repository';
import ImportsService from '../modules/imports/imports.service';
import TransferHelper from '../modules/transfer/transfer.helper';
import TransferService from '../modules/transfer/transfer.service';
import SqlColumnsService from '../modules/database/sql-columns.service';
import SqlTranserService from '../modules/database/sql-transfer.service';
import ApiColumnsService from '../modules/api/api-columns.service';
import ApiTransferService from '../modules/api/api-transfer.service';
import OAuthService from '../modules/oauth2/oauth2.service';
import ApiConnectionSerice from '../modules/api/api-connection.service';
import ConnectionService from '../modules/connection/connection.service';
import OAuth2AuthUriHelper from '../modules/oauth2/oauth2-auth-uri.helper';
import OAuth2RefreshTokenHelper from '../modules/oauth2/oath2-refresh-token.helper';
import SqlConnectionSerice from '../modules/database/sql-connection.service';

export default function setupServices(
  io: IO,
  datasetsRepository: DatasetsRepository,
  importsRepository: ImportsRepository,
  importProcessesRepository: ImportProcessesRepository,
  maxAttempts: number,
  delayAttempt: number
): {
  importsService: ImportsService;
  importProcessesService: ImportProcessesService;
  oAuth2Service: OAuthService;
} {
  const transferHelper = new TransferHelper(
    io,
    datasetsRepository,
    importProcessesRepository
  );
  const sqlTranserService = new SqlTranserService(
    importProcessesRepository,
    transferHelper
  );
  const apiTransferService = new ApiTransferService(
    importProcessesRepository,
    transferHelper
  );
  const transferService = new TransferService(
    io,
    importsRepository,
    importProcessesRepository,
    sqlTranserService,
    apiTransferService,
    maxAttempts,
    delayAttempt
  );

  const oAuth2AuthUriHelper = new OAuth2AuthUriHelper();
  const oAuth2RefreshTokenHelper = new OAuth2RefreshTokenHelper(
    importsRepository
  );
  const oAuth2Service = new OAuthService(importsRepository);

  const sqlConnectionService = new SqlConnectionSerice();
  const apiConnectionService = new ApiConnectionSerice(
    importsRepository,
    oAuth2RefreshTokenHelper
  );
  const connectionService = new ConnectionService(
    importsRepository,
    sqlConnectionService,
    apiConnectionService
  );

  const sqlColumnsService = new SqlColumnsService();
  const apiColumnsService = new ApiColumnsService();
  const columnsService = new ColumnsService(
    importsRepository,
    sqlColumnsService,
    apiColumnsService
  );

  const importsService = new ImportsService(
    importsRepository,
    importProcessesRepository,
    connectionService,
    columnsService,
    transferService,
    oAuth2AuthUriHelper
  );
  const importProcessesService = new ImportProcessesService(
    importProcessesRepository,
    importsRepository,
    connectionService,
    transferService,
    oAuth2AuthUriHelper
  );

  return {
    importsService,
    importProcessesService,
    oAuth2Service
  };
}
