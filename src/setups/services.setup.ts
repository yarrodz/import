import { Server as IO } from 'socket.io';

import DatasetsRepository from '../modules/datasets/datasets.repository';
import ImportProcessesRepository from '../modules/import-processes/import-processes.repository';
import ImportProcessesService from '../modules/import-processes/import-processes.service';
import ImportsRepository from '../modules/imports/imports.repository';
import ImportsService from '../modules/imports/imports.service';
import OAuthService from '../modules/oauth2/oauth2.service';
import OAuth2AuthUriHelper from '../modules/oauth2/oauth2-auth-uri.helper';
import OAuth2RefreshTokenHelper from '../modules/oauth2/oath2-refresh-token.helper';
import SqlTransferHelper from '../modules/sql/sql-transfer.helper';
import ChunkTransferHelper from '../modules/transfer/chunk-transfer.helper';
import TransferStepHelper from '../modules/transfer/transfer-step.helper';
import OffsetPaginationTransferHelper from '../modules/transfer/offset-pagination-transfer.helper';
import CursorPaginationTransferHelper from '../modules/transfer/cursor-pagination-transfer.helper';
import ApiTransferHelper from '../modules/api/api-transfer.helper';
import ApiConnectionHelper from '../modules/api/api-connection.helper';
import SqlColumnsHelper from '../modules/sql/sql-columns.helper';
import ApiColumnsHelper from '../modules/api/api-columns.helper';
import ApiImportService from '../modules/api/api-import.service';
import SqlImportService from '../modules/sql/sql-import.service';
import ImportTransferFailureHandler from '../modules/transfer/import-transfer-failure.handler';

export default function setupServices(
  io: IO,
  datasetsRepository: DatasetsRepository,
  importsRepository: ImportsRepository,
  importProcessesRepository: ImportProcessesRepository,
  maxAttempts: number,
  attemptDelayTime: number,
  oAuth2RedirectUri: string,
  clientUri: string
): {
  importsService: ImportsService;
  importProcessesService: ImportProcessesService;
  oAuth2Service: OAuthService;
  sqlTransferHelper: SqlTransferHelper;
  apiTransferHelper: ApiTransferHelper;
} {
  const transferStepHelper = new TransferStepHelper(
    io,
    datasetsRepository,
    importProcessesRepository
  );
  const chunkTransferHelper = new ChunkTransferHelper(
    io,
    transferStepHelper,
    importProcessesRepository
  );
  const offsetPaginationTransferHelper = new OffsetPaginationTransferHelper(
    io,
    transferStepHelper,
    importProcessesRepository
  );
  const cursorPaginationTransferHelper = new CursorPaginationTransferHelper(
    io,
    transferStepHelper,
    importProcessesRepository
  );
  const importTransferFailureHandler = new ImportTransferFailureHandler(
    io,
    importProcessesRepository,
    maxAttempts,
    attemptDelayTime
  );

  const sqlTransferHelper = new SqlTransferHelper(
    importProcessesRepository,
    importTransferFailureHandler,
    offsetPaginationTransferHelper
  );

  const apiTransferHelper = new ApiTransferHelper(
    importProcessesRepository,
    importTransferFailureHandler,
    chunkTransferHelper,
    offsetPaginationTransferHelper,
    cursorPaginationTransferHelper
  );

  const oAuth2AuthUriHelper = new OAuth2AuthUriHelper(oAuth2RedirectUri);
  const oAuth2RefreshTokenHelper = new OAuth2RefreshTokenHelper(
    importsRepository
  );
  const oAuth2Service = new OAuthService(
    importsRepository,
    oAuth2RedirectUri,
    clientUri
  );

  const apiConnectionHelper = new ApiConnectionHelper(
    importsRepository,
    oAuth2RefreshTokenHelper
  );

  const sqlColumnsHelper = new SqlColumnsHelper();
  const apiColumnsHelper = new ApiColumnsHelper();

  const sqlImportService = new SqlImportService(
    sqlColumnsHelper,
    sqlTransferHelper,
    importProcessesRepository
  );
  const apiImportService = new ApiImportService(
    apiConnectionHelper,
    apiColumnsHelper,
    apiTransferHelper,
    oAuth2AuthUriHelper,
    importProcessesRepository,
    importsRepository
  );

  const importsService = new ImportsService(
    importsRepository,
    importProcessesRepository,
    sqlImportService,
    apiImportService
  );
  const importProcessesService = new ImportProcessesService(
    importProcessesRepository,
    importsRepository,
    sqlImportService,
    apiImportService
  );

  return {
    importsService,
    importProcessesService,
    oAuth2Service,
    sqlTransferHelper,
    apiTransferHelper
  };
}
