import { iFrameTransfer } from 'iframe-ai';

import resolvePath from '../../../utils/resolve-path/resolve-path';
import chunkArray from '../../../utils/chunk-array/chunk-array';
import TransferFailureHandler from '../../transfers/helpers/transfer-failure.handler';
import ChunkTransferHelper from '../../transfers/helpers/chunk-transfer.helper';
import OffsetPaginationTransferHelper from '../../transfers/helpers/offset-pagination-transfer.helper';
import CursorPaginationTransferHelper from '../../transfers/helpers/cursor-pagination-transfer.helper';
import TransferFunction from '../../transfers/interfaces/transfer-function.interface';
import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Transfer from '../../transfers/interfaces/transfer.interface';
import ApiImport from '../interfaces/api-import.interface';
import ApiConnection from '../interfaces/api-connection.interface';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import ApiConnector from '../connector/api-connector';
import dbClient from '../../../utils/db-client/db-client';
import OffsetPaginationFunction from '../../transfers/interfaces/offset-pagination-function.interface';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import CursorPaginationFunction from '../../transfers/interfaces/cursor-pagination-function.interface';
import CursorPagination from '../../transfers/interfaces/cursor-pagination.interface';
import transformIFrameInstance from '../../../utils/transform-iFrame-instance/transform-iFrame-instance';

class ApiTransferHelper {
  private transferFailureHandler: TransferFailureHandler;
  private chunkTransferHelper: ChunkTransferHelper;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;
  private cursorPaginationTransferHelper: CursorPaginationTransferHelper;

  constructor(
    transferFailureHandler: TransferFailureHandler,
    chunkTransferHelper: ChunkTransferHelper,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper,
    cursorPaginationTransferHelper: CursorPaginationTransferHelper
  ) {
    this.transferFailureHandler = transferFailureHandler;
    this.chunkTransferHelper = chunkTransferHelper;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
    this.cursorPaginationTransferHelper = cursorPaginationTransferHelper;
  }

  public import: TransferFunction = async (
    synchronization: Synchronization,
    transfer: Transfer
  ): Promise<void> => {
    try {
      const impt = synchronization.import as ApiImport;
      const { transferMethod } = impt;

      switch (transferMethod) {
        case TransferMethod.CHUNK: {
          await this.chunkImport(synchronization, transfer);
          break;
        }
        case TransferMethod.OFFSET_PAGINATION: {
          await this.offsetPaginationImport(synchronization, transfer);
          break;
        }
        case TransferMethod.CURSOR_PAGINATION: {
          await this.cursorPaginationImport(synchronization, transfer);
          break;
        }
        default:
          throw new Error(
            `Error while transfer. Unknown transfer method '${transferMethod}'.`
          );
      }
    } catch (error) {
      await this.transferFailureHandler.handle(
        error,
        this.import,
        synchronization,
        transfer
      );
    }
  };

  private async chunkImport(
    synchronization: Synchronization,
    transfer: Transfer
  ) {
    const impt = synchronization.import as ApiImport;
    const connection = synchronization.connection as ApiConnection;
    const { datasetsPath } = impt;
    const { id: transferId, processedDatasetsCount: offset } = transfer;

    const apiConnector = new ApiConnector(impt, connection);
    await apiConnector.authRequest();

    const response = await apiConnector.sendRequest();
    let datasets = resolvePath(response, datasetsPath) as object[];

    let updatedTransfer = await new iFrameTransfer(
      dbClient,
      {
        totalDatasetsCount: datasets.length
      },
      transferId
    ).save();
    updatedTransfer = transformIFrameInstance(updatedTransfer);

    datasets = datasets.slice(offset, datasets.length);
    let chunkedDatasets = chunkArray(datasets, 100);
    datasets = null;

    await this.chunkTransferHelper.chunkTransfer(
      synchronization,
      updatedTransfer,
      chunkedDatasets
    );
  }

  private async offsetPaginationImport(
    synchronization: Synchronization,
    transfer: Transfer
  ) {
    const impt = synchronization.import as ApiImport;
    const connection = synchronization.connection as ApiConnection;
    const { totalDatasetsCount } = synchronization;
    const { paginationOptions, datasetsPath } = impt;
    const { limitValue } = paginationOptions;
    const { id: transferId } = transfer;

    let updatedTransfer = await new iFrameTransfer(
      dbClient,
      {
        totalDatasetsCount
      },
      transferId
    ).save();
    updatedTransfer = transformIFrameInstance(updatedTransfer);

    const apiConnector = new ApiConnector(impt, connection);
    await apiConnector.authRequest();

    await this.offsetPaginationTransferHelper.offsetPaginationTransfer(
      synchronization,
      updatedTransfer,
      limitValue,
      this.offetPaginationFunction,
      apiConnector,
      datasetsPath
    );
  }

  private async cursorPaginationImport(
    synchronization: Synchronization,
    transfer: Transfer
  ) {
    const impt = synchronization.import as ApiImport;
    const connection = synchronization.connection as ApiConnection;
    const { totalDatasetsCount } = synchronization;
    const { paginationOptions, datasetsPath } = impt;
    const { limitValue, cursorParameterPath } = paginationOptions;
    const { id: transferId } = transfer;

    let updatedTransfer = await new iFrameTransfer(
      dbClient,
      {
        totalDatasetsCount
      },
      transferId
    ).save();
    updatedTransfer = transformIFrameInstance(updatedTransfer);

    const apiConnector = new ApiConnector(impt, connection);
    await apiConnector.authRequest();

    await this.cursorPaginationTransferHelper.cursorPaginationTransfer(
      synchronization,
      updatedTransfer,
      limitValue,
      this.cursorPaginationFunction,
      apiConnector,
      cursorParameterPath,
      datasetsPath
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

export default ApiTransferHelper;
