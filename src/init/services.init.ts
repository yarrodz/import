import { Server as IO } from 'socket.io';

import { InitRepositoriesResult } from './repositories.init';
import OAuth2Service from '../modules/oauth2/oauth2.service';
import SqlColumnsHelper from '../modules/sql/helpers/sql-columns.helper';
import OffsetPaginationTransferHelper from '../modules/transfers/helpers/offset-pagination-transfer.helper';
import TransferFailureHandler from '../modules/transfers/helpers/transfer-failure.handler';
import ImportStepHelper from '../modules/transfers/helpers/import-step.helper';
import ChunkTransferHelper from '../modules/transfers/helpers/chunk-transfer.helper';
import CursorPaginationTransferHelper from '../modules/transfers/helpers/cursor-pagination-transfer.helper';
import OAuth2AuthUriHelper from '../modules/oauth2/helpers/oauth2-auth-uri.helper';
import ApiConnectionHelper from '../modules/api/helpers/api-connection.helper';
import TransfersService from '../modules/transfers/transfers.service';
import ImportsService from '../modules/imports/imports.service';
import ConnectionsService from '../modules/connections/connections.service';
import SqlImportHelper from '../modules/sql/helpers/sql-import.helper';
import ApiImportHelper from '../modules/api/helpers/api-import.helper';
import ApiColumnsHelper from '../modules/api/helpers/api-columns.helper';
import SqlImportService from '../modules/sql/sql-import.service';
import ApiImportService from '../modules/api/api-import.service';
import SqlTransferService from '../modules/sql/sql-transfer.service';
import ApiTransferService from '../modules/api/api-transfer.service';
import OAuth2RefreshTokenHelper from '../modules/oauth2/helpers/oath2-refresh-token.helper';

export interface InitServicesParams extends InitRepositoriesResult {
  io: IO;
  clientUri: string;
  oAuth2RedirectUri: string;
}

export interface InitServicesResult {
  connectionsService: ConnectionsService;
  importsService: ImportsService;
  transfersService: TransfersService;
  oAuth2Service: OAuth2Service;
}

export default function initServices(
  params: InitServicesParams
): InitServicesResult {
  const {
    io,
    clientUri,
    oAuth2RedirectUri,
    datasetsRepository,
    connectionsRepository,
    processesRepository,
    transfersRepository
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

  const transferFailureHandler = new TransferFailureHandler(
    io,
    transfersRepository
  );
  const importStepHelper = new ImportStepHelper(
    io,
    transfersRepository,
    datasetsRepository
  );
  const chunkTransferHelper = new ChunkTransferHelper(
    io,
    importStepHelper,
    transfersRepository
  );
  const offsetPaginationTransferHelper = new OffsetPaginationTransferHelper(
    io,
    importStepHelper,
    transfersRepository
  );
  const cursorPaginationTransferHelper = new CursorPaginationTransferHelper(
    io,
    importStepHelper,
    transfersRepository
  );

  const apiConnectionHelper = new ApiConnectionHelper(
    oAuth2RefreshTokenHelper,
    processesRepository
  );

  const sqlColumnsHelper = new SqlColumnsHelper();
  const apiColumnsHelper = new ApiColumnsHelper();

  const sqlImportHelper = new SqlImportHelper(
    transferFailureHandler,
    offsetPaginationTransferHelper,
    transfersRepository
  );
  const apiImportHelper = new ApiImportHelper(
    apiConnectionHelper,
    transferFailureHandler,
    chunkTransferHelper,
    offsetPaginationTransferHelper,
    cursorPaginationTransferHelper,
    transfersRepository
  );

  const sqlImportService = new SqlImportService(
    sqlColumnsHelper,
    sqlImportHelper,
    transfersRepository
  );
  const apiImportService = new ApiImportService(
    apiConnectionHelper,
    apiColumnsHelper,
    apiImportHelper,
    oAuth2AuthUriHelper,
    processesRepository,
    transfersRepository
  );

  const sqlTransferService = new SqlTransferService(
    sqlImportHelper,
    transfersRepository
  );
  const apiTransferService = new ApiTransferService(
    apiConnectionHelper,
    apiImportHelper,
    oAuth2AuthUriHelper,
    processesRepository,
    transfersRepository
  );

  const connectionsService = new ConnectionsService(connectionsRepository);
  const importsService = new ImportsService(
    sqlImportService,
    apiImportService,
    processesRepository
  );
  const transfersService = new TransfersService(
    sqlTransferService,
    apiTransferService,
    transfersRepository,
    processesRepository
  );

  return {
    connectionsService,
    importsService,
    transfersService,
    oAuth2Service
  };
}
