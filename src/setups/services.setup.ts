import { Server as IO } from 'socket.io';

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

export default function setupServices(
  io: IO,
  clientUri: string,
  oAuth2RedirectUri: string
): {
  importsService: ImportsService;
  transfersService: TransfersService;
  oAuth2Service: OAuth2Service;
} {
  const oAuth2AuthUriHelper = new OAuth2AuthUriHelper(oAuth2RedirectUri);
  const oAuth2Service = new OAuth2Service(oAuth2RedirectUri, clientUri);

  const transferFailureHandler = new TransferFailureHandler(io);
  const importStepHelper = new ImportStepHelper(io);
  const chunkTransferHelper = new ChunkTransferHelper(io, importStepHelper);
  const offsetPaginationTransferHelper = new OffsetPaginationTransferHelper(
    io,
    importStepHelper
  );
  const cursorPaginationTransferHelper = new CursorPaginationTransferHelper(
    io,
    importStepHelper
  );

  const apiConnectionHelper = new ApiConnectionHelper();

  const sqlColumnsHelper = new SqlColumnsHelper();
  const apiColumnsHelper = new ApiColumnsHelper();

  const sqlImportHelper = new SqlImportHelper(
    transferFailureHandler,
    offsetPaginationTransferHelper
  );
  const apiImportHelper = new ApiImportHelper(
    apiConnectionHelper,
    transferFailureHandler,
    chunkTransferHelper,
    offsetPaginationTransferHelper,
    cursorPaginationTransferHelper
  );

  const sqlImportService = new SqlImportService(sqlImportHelper);
  const apiImportService = new ApiImportService(
    apiImportHelper,
    oAuth2AuthUriHelper
  );

  const sqlTransferService = new SqlTransferService(sqlImportHelper);
  const apiTransferService = new ApiTransferService(
    apiImportHelper,
    oAuth2AuthUriHelper
  );

  const connectionsService = new ConnectionsService();
  const importsService = new ImportsService(sqlImportService, apiImportService);
  const transfersService = new TransfersService(
    sqlTransferService,
    apiTransferService
  );

  return {
    importsService,
    transfersService,
    oAuth2Service
  };
}
