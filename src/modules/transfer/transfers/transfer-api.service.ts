import ImportProcessesRepository from '../../import-processes/import-processes.repository';
import TransferHelper from '../transfer.helper';
import { IImportDocument } from '../../imports/import.schema';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import { TransferType } from '../enums/transfer-type.enum';
import ApiConnection from '../../api/connection/api-connection';
import IPaginationFunction from '../interfaces/pagination-function.interface';
import IPaginationValues from '../interfaces/pagination.interface';
import { IRequest } from '../../api/sub-schemas/request.schema';

class TransferAPIService {
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
    process: IImportProcessDocument,
    limit: number
  ): Promise<void> {
    const api = impt.api;
    const { transferType } = api;
    const processId = process._id;

    const offset = process.processedDatasetsCount;

    switch (transferType) {
      case TransferType.CHUNK:
        await this.chunkTransfer(impt, processId, offset, limit);
        break;
      case TransferType.PAGINATION:
        await this.paginationTranfer(impt, processId, offset, limit);
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
    limit: number
  ) {
    const { request, idColumn } = impt.api;
    const apiConnection = new ApiConnection(request);
    // await apiConnection.authorize();

    let retrievedDatasets = await apiConnection.send();

    await this.importProcessesRepository.update(processId, {
      datasetsCount: retrievedDatasets.length
    });

    retrievedDatasets = retrievedDatasets.slice(
      offset,
      retrievedDatasets.length
    );
    let chunkedDatasets = JSON.parse(
      JSON.stringify(this.chunkArray(retrievedDatasets, limit))
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
    limit: number
  ) {
    const api = impt.api;
    const { idColumn, datasetsCount, request } = api;

    const apiConnection = new ApiConnection(request);
    // await apiConnection.authorize();

    await this.importProcessesRepository.update(processId, { datasetsCount });
    await this.transferHelper.paginationTransfer(
      impt,
      processId,
      idColumn,
      datasetsCount,
      offset,
      limit,
      this.apiPaginationFunction,
      apiConnection
    );
  }

  private apiPaginationFunction: IPaginationFunction = async (
    offset: number,
    limit: number,
    apiConnection: ApiConnection
  ) => {
    const pagination: IPaginationValues = {
      offset,
      limit
    };
    return await apiConnection.send(pagination);
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

  //   const apiConnection = new ApiConnection(api);
  //   const readable = (await apiConnection.send()) as unknown as ReadStream;

  //   await this.importProcessesRepository.update(processId, { datasetsCount });
  //   await this.transferHelper.streamTransfer(
  //     impt,
  //     processId,
  //     idColumn,
  //     readable
  //   );
  // }
}

export default TransferAPIService;
