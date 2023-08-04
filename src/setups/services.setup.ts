import { Server as IO } from 'socket.io';

import SynchronizationsService from '../modules/synchronizations/synchronizations.service';
import OAuth2Service from '../modules/oauth2/oauth2.service';
import SqlSynchronizationService from '../modules/sql/sql-synchronization.service';
import ApiSynchronizationService from '../modules/api/api-synchronization.service';
import SqlColumnsHelper from '../modules/sql/helpers/sql-columns.helper';
import OffsetPaginationTransferHelper from '../modules/transfers/helpers/offset-pagination-transfer.helper';
import TransferFailureHandler from '../modules/transfers/helpers/transfer-failure.handler';
import ImportStepHelper from '../modules/transfers/helpers/import-step.helper';
import SqlTransferHelper from '../modules/sql/helpers/sql-transfer.helper';
import ApiColumnsHelper from '../modules/api/helpers/api-columns.helper';
import ChunkTransferHelper from '../modules/transfers/helpers/chunk-transfer.helper';
import CursorPaginationTransferHelper from '../modules/transfers/helpers/cursor-pagination-transfer.helper';
import ApiTransferHelper from '../modules/api/helpers/api-transfer.helper';
import OAuth2AuthUriHelper from '../modules/oauth2/helpers/oauth2-auth-uri.helper';
import OAuth2RefreshTokenHelper from '../modules/oauth2/helpers/oath2-refresh-token.helper';
import ApiConnectionHelper from '../modules/api/helpers/api-connection.helper';
import TransfersService from '../modules/transfers/transfers.service';

export default function setupServices(
  io: IO,
  clientUri: string,
  oAuth2RedirectUri: string
): {
  synchronizationsService: SynchronizationsService;
  transfersService: TransfersService;
  oAuth2Service: OAuth2Service;
} {
  const oAuth2AuthUriHelper = new OAuth2AuthUriHelper(oAuth2RedirectUri);
  const oAuth2RefreshTokenHelper = new OAuth2RefreshTokenHelper();
  const oAuth2Service = new OAuth2Service(oAuth2RedirectUri, clientUri);

  const sqlColumnsHelper = new SqlColumnsHelper();
  const apiColumnsHelper = new ApiColumnsHelper();

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

  const apiConnectionHelper = new ApiConnectionHelper(oAuth2RefreshTokenHelper);

  const sqlTransferHelper = new SqlTransferHelper(
    transferFailureHandler,
    offsetPaginationTransferHelper
  );

  const apiTransferHelper = new ApiTransferHelper(
    transferFailureHandler,
    chunkTransferHelper,
    offsetPaginationTransferHelper,
    cursorPaginationTransferHelper
  );

  const sqlSynchronizationService = new SqlSynchronizationService(
    sqlColumnsHelper,
    sqlTransferHelper
  );
  const apiSynchronizationService = new ApiSynchronizationService(
    apiConnectionHelper,
    apiColumnsHelper,
    apiTransferHelper,
    oAuth2AuthUriHelper
  );

  const synchronizationsService = new SynchronizationsService(
    sqlSynchronizationService,
    apiSynchronizationService
  );
  const transfersService = new TransfersService(
    sqlSynchronizationService,
    apiSynchronizationService
  );

  return {
    synchronizationsService,
    transfersService,
    oAuth2Service
  };
}
