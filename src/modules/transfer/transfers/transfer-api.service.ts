import { IImportDocument } from '../../imports/import.schema';
import ImportProcessesRepository from '../../import-processes/import-processes.repository';
import TransferHelper from '../transfer.helper';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';
import { sendRequest } from '../../../utils/api/request-sender';
import { TransferType } from '../enums/transfer-type.enum';
import IPaginationFunction from '../interfaces/pagination-function.interface';
import { buildPaginationRequest, buildRequest } from '../../../utils/api/request-builder';
import { IApi } from '../../imports/sub-schemas/api.schema';

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
    const requestConfig = impt.api.requestConfig;
    const path = impt.api.path;
    const idColumn = impt.api.idColumn;
    const processId = process._id;
    const transferType = impt.api.transferType;
    const datasetsCount = impt.api;

    const offset = process.processedDatasetsCount;

    if (transferType === TransferType.PAGINATION) {
      const { offsetParameter, limitParameter, paginationPlacement, path } =
        impt.api.transferOptions;

      // await this.transferHelper.paginationTransfer(impt, processId, idColumn, datasetsCount, offset, this.limit, this.apiPaginationFunction, api)

    } else if (transferType === TransferType.CHUNK) {
      const request = buildRequest(impt.api);
      let retrievedDatasets = await sendRequest(request, path);

      const { processedDatasetsCount } = process;

      let datasetsToImport = retrievedDatasets.slice(
        processedDatasetsCount,
        retrievedDatasets.length
      );
      let chunkedDatasets = JSON.parse(
        JSON.stringify(this.chunkArray(datasetsToImport, limit))
      ) as object[][];

      retrievedDatasets = null;
      datasetsToImport = null;

      await this.transferHelper.chunkTransfer(
        chunkedDatasets,
        impt,
        processId,
        idColumn
      );
    }
  }

  private apiPaginationFunction: IPaginationFunction = async (
    offset: number,
    limit: number,
    api: IApi,
  ) => {
    const request = buildPaginationRequest(
      api,
      offset,
      limit,
    );
    return await sendRequest(request, api.path);
  };

  private chunkArray(array: object[], chunkSize: number) {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      chunkedArray.push(chunk);
    }
    return chunkedArray;
  }
}

export default TransferAPIService;
