import ImportProcessesRepository from '../import-processes/import-processes.repository';
import TransferHelper from '../transfer/transfer.helper';
import { IImportDocument } from '../imports/import.schema';
import { IImportProcessDocument } from '../import-processes/import-process.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import ApiConnector from './connector/api-connector';
import IPaginationFunction from '../transfer/interfaces/pagination-function.interface';
import IPaginationValues from '../transfer/interfaces/pagination.interface';

class ApiTransferService {
  private importProcessesRepository: ImportProcessesRepository;
  private transferHelper: TransferHelper;

  constructor(
    importProcessesRepository: ImportProcessesRepository,
    transferHelper: TransferHelper
  ) {
    this.importProcessesRepository = importProcessesRepository;
    this.transferHelper = transferHelper;
  }

  public async transfer(
    impt: IImportDocument,
    process: IImportProcessDocument
  ): Promise<void> {
    const api = impt.api;
    const { transferType, limitPerSecond } = api;
    const processId = process._id;

    const offset = process.processedDatasetsCount;

    switch (transferType) {
      case TransferType.CHUNK:
        await this.chunkTransfer(impt, processId, offset, limitPerSecond);
        break;
      case TransferType.PAGINATION:
        await this.paginationTranfer(impt, processId, offset, limitPerSecond);
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
    offset: number,
    limitPerSecond: number
  ) {
    const { request, idColumn } = impt.api;
    const apiConnector = new ApiConnector(request);
    await apiConnector.authorizeRequest();

    let retrievedDatasets = await apiConnector.send();
    await this.importProcessesRepository.update(processId, {
      datasetsCount: retrievedDatasets.length
    });

    retrievedDatasets = retrievedDatasets.slice(
      offset,
      retrievedDatasets.length
    );
    let chunkedDatasets = JSON.parse(
      JSON.stringify(this.chunkArray(retrievedDatasets, limitPerSecond))
    ) as object[][];

    retrievedDatasets = null;

    await this.transferHelper.chunkTransfer(
      chunkedDatasets,
      impt,
      processId,
      idColumn
    );
  }

  private async paginationTranfer(
    impt: IImportDocument,
    processId: string,
    offset: number,
    limitPerSecond: number
  ) {
    const api = impt.api;
    const { idColumn, datasetsCount, request } = api;

    const apiConnector = new ApiConnector(request);
    await apiConnector.authorizeRequest();

    await this.importProcessesRepository.update(processId, { datasetsCount });
    await this.transferHelper.paginationTransfer(
      impt,
      processId,
      idColumn,
      datasetsCount,
      offset,
      limitPerSecond,
      this.apiPaginationFunction,
      apiConnector
    );
  }

  private apiPaginationFunction: IPaginationFunction = async (
    offset: number,
    limit: number,
    apiConnector: ApiConnector
  ) => {
    const pagination: IPaginationValues = {
      offset,
      limit
    };
    return await apiConnector.send(pagination);
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

export default ApiTransferService;
