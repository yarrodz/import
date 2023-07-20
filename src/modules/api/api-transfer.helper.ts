import ImportProcessesRepository from '../import-processes/import-processes.repository';
import ChunkTransferHelper from '../transfer/chunk-transfer.helper';
import OffsetPaginationTransferHelper from '../transfer/offset-pagination-transfer.helper';
import CursorPaginationTransferHelper from '../transfer/cursor-pagination-transfer.helper';
import ImportTransferFailureHandler from '../transfer/import-transfer-failure.handler';
import { IImportDocument } from '../imports/import.schema';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import IImportTransferFunction from '../transfer/interfaces/import-transfer-function.interface';
import ApiConnector from './connector/api-connector';
import ICursorPaginationFunction from '../transfer/interfaces/cursor-pagination-function.interface';
import ICursorPagination from '../transfer/interfaces/cursor-pagination.interface';
import IOffsetPaginationFunction from '../transfer/interfaces/offset-pagination-function.interface';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';
import resolvePath from '../../utils/resolve-path/resolve-path';
import chunkArray from '../../utils/chunk-array/chunk-array';

class ApiTransferHelper {
  private importProcessesRepository: ImportProcessesRepository;
  private importTransferFailureHandler: ImportTransferFailureHandler;
  private chunkTransferHelper: ChunkTransferHelper;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;
  private cursorPaginationTransferHelper: CursorPaginationTransferHelper;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    importTransferFailureHandler: ImportTransferFailureHandler,
    chunkTransferHelper: ChunkTransferHelper,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper,
    cursorPaginationTransferHelper: CursorPaginationTransferHelper
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.importTransferFailureHandler = importTransferFailureHandler;
    this.chunkTransferHelper = chunkTransferHelper;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
    this.cursorPaginationTransferHelper = cursorPaginationTransferHelper;
  }

  public transfer: IImportTransferFunction = async (
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> => {
    try {
      const { api } = impt;
      const { transferType } = api;
      const { _id: processId } = process;

      switch (transferType) {
        case TransferType.CHUNK: {
          await this.chunkTransfer(impt, processId);
          break;
        }
        case TransferType.OFFSET_PAGINATION: {
          await this.offsetPaginationTranfer(impt, processId);
          break;
        }
        case TransferType.CURSOR_PAGINATION: {
          await this.cursorPaginationTranfer(impt, processId);
          break;
        }
        default:
          throw new Error(
            `Error while transfer. Unknown transfer type '${transferType}'.`
          );
      }
    } catch (error) {
      await this.importTransferFailureHandler.handle(
        error,
        this.transfer,
        impt,
        process
      );
    }
  };

  private async chunkTransfer(impt: IImportDocument, processId: string) {
    const { api } = impt;
    const { datasetsPath } = api;

    const process = await this.importProcessesRepository.findById(processId);
    const offset = process.processedDatasetsCount;

    const apiConnector = new ApiConnector(api);
    await apiConnector.authorizeRequest();

    const response = await apiConnector.sendRequest();
    let datasets = resolvePath(response, datasetsPath) as object[];

    await this.importProcessesRepository.update(processId, {
      datasetsCount: datasets.length
    });

    datasets = datasets.slice(offset, datasets.length);
    let chunkedDatasets = chunkArray(datasets, 100);
    datasets = null;

    await this.chunkTransferHelper.chunkTransfer(
      impt,
      processId,
      chunkedDatasets
    );
  }

  private async offsetPaginationTranfer(
    impt: IImportDocument,
    processId: string
  ) {
    const { api, datasetsCount } = impt;
    const { paginationOptions, datasetsPath } = api;
    const { limitValue } = paginationOptions;

    await this.importProcessesRepository.update(processId, { datasetsCount });

    const apiConnector = new ApiConnector(api);
    await apiConnector.authorizeRequest();

    await this.offsetPaginationTransferHelper.offsetPaginationTransfer(
      impt,
      processId,
      limitValue,
      this.offetPaginationFunction,
      apiConnector,
      datasetsPath
    );
  }

  private async cursorPaginationTranfer(
    impt: IImportDocument,
    processId: string
  ) {
    const { api, datasetsCount } = impt;
    const { paginationOptions, datasetsPath } = api;
    const { limitValue, cursorParameterPath } = paginationOptions;

    await this.importProcessesRepository.update(processId, { datasetsCount });

    const apiConnector = new ApiConnector(api);
    await apiConnector.authorizeRequest();

    await this.cursorPaginationTransferHelper.cursorPaginationTransfer(
      impt,
      processId,
      limitValue,
      this.cursorPaginationFunction,
      apiConnector,
      cursorParameterPath,
      datasetsPath
    );
  }

  private offetPaginationFunction: IOffsetPaginationFunction = async (
    offsetPagination: IOffsetPagination,
    apiConnector: ApiConnector,
    datasetsPath: string
  ) => {
    apiConnector.paginateRequest(offsetPagination);
    const data = await apiConnector.sendRequest();
    return resolvePath(data, datasetsPath) as object[];
  };

  private cursorPaginationFunction: ICursorPaginationFunction = async (
    cursorPagination: ICursorPagination,
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
