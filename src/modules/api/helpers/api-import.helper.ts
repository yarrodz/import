import ApiConnectionHelper from './api-connection.helper';
import TransfersRepository from '../../transfers/transfers.repository';
import TransferFailureHandler from '../../transfers/helpers/transfer-failure.handler';
import ChunkTransferHelper from '../../transfers/helpers/chunk-transfer.helper';
import OffsetPaginationTransferHelper from '../../transfers/helpers/offset-pagination-transfer.helper';
import CursorPaginationTransferHelper from '../../transfers/helpers/cursor-pagination-transfer.helper';
import OuterTransferFunction, {
  OuterTransferFunctionParams
} from '../../transfers/interfaces/outer-transfer-function.interface';
import ApiImport from '../interfaces/api-import.interface';
import Transfer from '../../transfers/interfaces/transfer.interface';
import ApiConnector from '../connector/api-connector';
import ChunkTransferParams from '../../transfers/interfaces/chunk-transfer-params.interface';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import OffsetPaginationFunction from '../../transfers/interfaces/offset-pagination-function.interface';
import OffsetPaginationTransferParams from '../../transfers/interfaces/offset-pagination-transfer-params.interface';
import CursorPagination from '../../transfers/interfaces/cursor-pagination.interface';
import CursorPaginationFunction from '../../transfers/interfaces/cursor-pagination-function.interface';
import CursorPaginationTransferParams from '../../transfers/interfaces/cursor-pagination-transfer-params.interface';
import { ConnectionState } from '../enums/connection-state.enum';
import { TransferStatus } from '../../transfers/enums/transfer-status.enum';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import resolvePath from '../../../utils/resolve-path/resolve-path';

class ApiImportHelper {
  private apiConnectionHelper: ApiConnectionHelper;
  private transferFailureHandler: TransferFailureHandler;
  private chunkTransferHelper: ChunkTransferHelper;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;
  private cursorPaginationTransferHelper: CursorPaginationTransferHelper;
  private transfersRepository: TransfersRepository;

  constructor(
    apiConnectionHelper: ApiConnectionHelper,
    transferFailureHandler: TransferFailureHandler,
    chunkTransferHelper: ChunkTransferHelper,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper,
    cursorPaginationTransferHelper: CursorPaginationTransferHelper,
    transfersRepository: TransfersRepository
  ) {
    this.apiConnectionHelper = apiConnectionHelper;
    this.transferFailureHandler = transferFailureHandler;
    this.chunkTransferHelper = chunkTransferHelper;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
    this.cursorPaginationTransferHelper = cursorPaginationTransferHelper;
    this.transfersRepository = transfersRepository;
  }

  public import: OuterTransferFunction = async (
    params: OuterTransferFunctionParams
  ): Promise<void> => {
    const impt = params.import as ApiImport;
    const { transferMethod } = impt;
    const { transfer } = params;
    const { id: transferId, log } = transfer;
    try {
      const connectionState = await this.apiConnectionHelper.connect(impt);
      if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
        log.unshift('Transfer was paused due OAuth2 authentication requirement.');

        await this.transfersRepository.update({
          id: transferId,
          status: TransferStatus.PAUSED,
          log
        });
      }

      switch (transferMethod) {
        case TransferMethod.CHUNK: {
          await this.chunkImport(impt, transfer);
          break;
        }
        case TransferMethod.OFFSET_PAGINATION: {
          await this.offsetPaginationImport(impt, transfer);
          break;
        }
        case TransferMethod.CURSOR_PAGINATION: {
          await this.cursorPaginationImport(impt, transfer);
          break;
        }
        default:
          throw new Error(
            `Error while transfer. Unknown transfer method '${transferMethod}'.`
          );
      }
    } catch (error) {
      await this.transferFailureHandler.handle({
        error,
        outerTransferFunction: this.import,
        import: impt,
        transfer
      });
    }
  };

  private async chunkImport(impt: ApiImport, transfer: Transfer) {
    const { datasetsPath } = impt;

    const apiConnector = new ApiConnector(impt);
    await apiConnector.authRequest();

    const response = await apiConnector.sendRequest();
    let datasets = resolvePath(response, datasetsPath) as object[];

    const chunkTransferParams: ChunkTransferParams = {
      import: impt,
      transfer,
      datasets,
      chunkLength: 100
    };

    await this.chunkTransferHelper.transfer(chunkTransferParams);
  }

  private async offsetPaginationImport(impt: ApiImport, transfer: Transfer) {
    const { paginationOptions, datasetsPath } = impt;
    const { limitValue } = paginationOptions;

    const apiConnector = new ApiConnector(impt);
    await apiConnector.authRequest();

    const offsetPaginationTransferParams: OffsetPaginationTransferParams = {
      import: impt,
      transfer,
      limitPerStep: limitValue,
      paginationFunction: {
        fn: this.offetPaginationFunction,
        params: [apiConnector, datasetsPath]
      }
    };

    await this.offsetPaginationTransferHelper.transfer(
      offsetPaginationTransferParams
    );
  }

  private async cursorPaginationImport(impt: ApiImport, transfer: Transfer) {
    const { paginationOptions, datasetsPath } = impt;
    const { limitValue, cursorPath } = paginationOptions;

    const apiConnector = new ApiConnector(impt);
    await apiConnector.authRequest();

    const cursorPaginationTransferParams: CursorPaginationTransferParams = {
      import: impt,
      transfer,
      limitPerStep: limitValue,
      paginationFunction: {
        fn: this.cursorPaginationFunction,
        params: [apiConnector, cursorPath, datasetsPath]
      }
    };

    await this.cursorPaginationTransferHelper.transfer(
      cursorPaginationTransferParams
    );
  }

  private offetPaginationFunction: OffsetPaginationFunction = async (
    offsetPagination: OffsetPagination,
    apiConnector: ApiConnector,
    datasetsPath: string
  ) => {
    apiConnector.paginateRequest(offsetPagination);
    const data = await apiConnector.sendRequest();
    return resolvePath(data, datasetsPath) as object[];
  };

  private cursorPaginationFunction: CursorPaginationFunction = async (
    cursorPagination: CursorPagination,
    apiConnector: ApiConnector,
    cursorPath: string,
    datasetsPath: string
  ) => {
    apiConnector.paginateRequest(cursorPagination);
    const data = await apiConnector.sendRequest();
    const cursor = resolvePath(data, cursorPath) as unknown as string;
    const datasets = resolvePath(data, datasetsPath) as object[];
    return {
      cursor,
      datasets
    };
  };
}

export default ApiImportHelper;
