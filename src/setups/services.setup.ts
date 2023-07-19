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

export default function setupServices(
  io: IO,
  datasetsRepository: DatasetsRepository,
  importsRepository: ImportsRepository,
  importProcessesRepository: ImportProcessesRepository
): {
  importsService: ImportsService;
  importProcessesService: ImportProcessesService;
  oAuth2Service: OAuthService;
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

  const sqlTransferHelper = new SqlTransferHelper(
    importProcessesRepository,
    offsetPaginationTransferHelper
  );
  const apiTransferHelper = new ApiTransferHelper(
    importProcessesRepository,
    chunkTransferHelper,
    offsetPaginationTransferHelper,
    cursorPaginationTransferHelper
  );

  const oAuth2AuthUriHelper = new OAuth2AuthUriHelper();
  const oAuth2RefreshTokenHelper = new OAuth2RefreshTokenHelper(
    importsRepository
  );

  const apiConnectionHelper = new ApiConnectionHelper(
    importsRepository,
    oAuth2RefreshTokenHelper
  );

  const sqlColumnsHelper = new SqlColumnsHelper();
  const apiColumnsHelper = new ApiColumnsHelper();

  const oAuth2Service = new OAuthService(importsRepository);

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
    importProcessesRepository
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
    oAuth2Service
  };
}
