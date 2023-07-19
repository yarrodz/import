import ImportProcessesRepository from '../import-processes/import-processes.repository';
import ChunkTransferHelper from '../transfer/chunk-transfer.helper';
import OffsetPaginationTransferHelper from '../transfer/offset-pagination-transfer.helper';
import CursorPaginationTransferHelper from '../transfer/cursor-pagination-transfer.helper';
import { IImportDocument } from '../imports/import.schema';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import ApiConnector from './connector/api-connector';
import IPaginationFunction from '../transfer/interfaces/offset-pagination-function.interface';
import ICursorPaginationFunction from '../transfer/interfaces/cursor-pagination-function.interface';
import ICursorPagination from '../transfer/interfaces/cursor-pagination.interface';
import resolvePath from '../../utils/resolve-path/resolve-path';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';

class ApiTransferHelper {
  private importProcessesRepository: ImportProcessesRepository;
  private chunkTransferHelper: ChunkTransferHelper;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;
  private cursorPaginationTransferHelper: CursorPaginationTransferHelper;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    chunkTransferHelper: ChunkTransferHelper,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper,
    cursorPaginationTransferHelper: CursorPaginationTransferHelper
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.chunkTransferHelper = chunkTransferHelper;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
    this.cursorPaginationTransferHelper = cursorPaginationTransferHelper;
  }

  public async transfer(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    const { api } = impt;
    const { transferType } = api;
    const processId = process._id;

    const offset = process.processedDatasetsCount;

    switch (transferType) {
      case TransferType.CHUNK:
        await this.chunkTransfer(impt, processId, offset);
        break;
      case TransferType.OFFSET_PAGINATION:
        await this.offsetPaginationTranfer(impt, processId);
        break;
      case TransferType.CURSOR_PAGINATION:
        await this.cursorPaginationTranfer(impt, processId);
        break;
      // case TransferType.STREAM:
      //   await this.streamTransfer(impt, processId);
      //   break;
      default:
        throw new Error('Error while transfer. Unknown transfer type');
    }
  }

  private async chunkTransfer(
    impt: IImportDocument,
    processId: string,
    offset: number
  ) {
    const { api } = impt;
    const { datasetsPath } = api;
    const apiConnector = new ApiConnector(api);
    await apiConnector.authorizeRequest();

    const response = await apiConnector.send();
    let datasets = resolvePath(response, datasetsPath) as object[];
    await this.importProcessesRepository.update(processId, {
      datasetsCount: datasets.length
    });

    datasets = datasets.slice(offset, datasets.length);
    let chunkedDatasets = JSON.parse(
      JSON.stringify(this.chunkArray(datasets, 100))
    ) as object[][];

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

    const apiConnector = new ApiConnector(api);
    await apiConnector.authorizeRequest();

    await this.importProcessesRepository.update(processId, { datasetsCount });
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

    const apiConnector = new ApiConnector(api);
    await apiConnector.authorizeRequest();

    await this.importProcessesRepository.update(processId, { datasetsCount });
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

  private offetPaginationFunction: IPaginationFunction = async (
    offsetPagination: IOffsetPagination,
    apiConnector: ApiConnector,
    datasetsPath: string
  ) => {
    const data = await apiConnector.send(offsetPagination);
    return resolvePath(data, datasetsPath) as object[];
  };

  private cursorPaginationFunction: ICursorPaginationFunction = async (
    cursorPagination: ICursorPagination,
    apiConnector: ApiConnector,
    cursorPath: string,
    datasetsPath: string
  ) => {
    const data = await apiConnector.send(cursorPagination);
    const cursor = resolvePath(data, cursorPath) as unknown as string;
    const datasets = resolvePath(data, datasetsPath) as object[];
    return {
      cursor,
      datasets
    };
  };

  private chunkArray(array: object[], chunkSize: number) {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      chunkedArray.push(chunk);
    }
    return chunkedArray;
  }

  // private async streamTransfer(impt: IImportDocument, processId: string) {
  //   const api = impt.api;
  //   const { idColumn, datasetsCount } = api;

  //   const apiConnector = new ApiConnector(api);
  //   const readable = (await apiConnector.send()) as unknown as ReadStream;

  //   await this.importProcessesRepository.update(processId, { datasetsCount });
  //   await this.transferHelper.streamTransfer(
  //     impt,
  //     processId,
  //     idColumn,
  //     readable
  //   );
  // }
}

export default ApiTransferHelper;
