import { ApiConnectionHelper } from './api-connection.helper';
import { TransfersRepository } from '../../transfer-processes/transfer-processes.repository';
import { TransferFailureHandler } from '../../transfer-processes/helpers/transfer-failure-handler.helper';
// import { ChunkTransferHelper } from '../../transfers/helpers/chunk-transfer.helper';
// import { OffsetPaginationTransferHelper } from '../../transfers/helpers/offset-pagination-transfer.helper';
export class ApiTransferHelper {
  private apiTransferHelper: ApiTransferHelper;
  private apiConnectionHelper: ApiConnectionHelper;
  private transferFailureHandler: TransferFailureHandler;
  private transfersRepository: TransfersRepository;

  constructor(
    apiTransferHelper: ApiTransferHelper,
    apiConnectionHelper: ApiConnectionHelper,
    transfersRepository: TransfersRepository
  ) {
    this.apiTransferHelper = apiTransferHelper;
    this.apiConnectionHelper = apiConnectionHelper;
    this.transferFailureHandler = transferFailureHandler;
    // this.chunkTransferHelper = chunkTransferHelper;
    // this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
    // this.cursorPaginationTransferHelper = cursorPaginationTransferHelper;
    this.transfersRepository = transfersRepository;
  }

  public import: OuterTransferFunction = async (
    params: OuterTransferFunctionParams
  ): Promise<void> => {
    // const impt = params.import as ApiImport;
    // const { transferMethod } = impt;
    // let { transfer } = params;
    try {
      //   if (transfer === undefined) {
      //     transfer = await this.apiTransferHelper.createStartedTransfer(impt);
      //   }
      //   const { id: transferId } = transfer;
      //   const connectionstatus = await this.apiConnectionHelper.connect(impt);
      //   if (connectionstatus === Connectionstatus.OAUTH2_REQUIRED) {
      //     await this.transfersRepository.update({
      //       id: transferId,
      //       status: TransferStatus.PAUSED,
      //       log: 'Transfer was paused due OAuth2 authentication requirement.'
      //     });
      //   }
      //   switch (transferMethod) {
      //     case TransferMethod.CHUNK: {
      //       await this.chunkImport(impt, transfer);
      //       break;
      //     }
      //     case TransferMethod.OFFSET_PAGINATION: {
      //       await this.offsetPaginationImport(impt, transfer);
      //       break;
      //     }
      //     case TransferMethod.CURSOR_PAGINATION: {
      //       await this.cursorPaginationImport(impt, transfer);
      //       break;
      //     }
      //     default:
      //       throw new Error(
      //         `Error while transfer. Unknown transfer method '${transferMethod}'.`
      //       );
      //   }
    } catch (error) {
      // await this.transferFailureHandler.handle({
      //   error,
      //   outerTransferFunction: this.import,
      //   import: impt,
      //   transfer
      // });
    }
  };

  private async chunkImport(impt: ApiImport, transfer: Transfer) {
    // const { datasetsPath } = impt;
    // const apiConnector = new ApiConnector(impt);
    // await apiConnector.authRequest();
    // const response = await apiConnector.sendRequest();
    // let datasets = resolvePath(response, datasetsPath) as object[];
    // const chunkTransferParams: ChunkTransferParams = {
    //   import: impt,
    //   transfer,
    //   datasets,
    //   chunkLength: 100
    // };
    // await this.chunkTransferHelper.transfer(chunkTransferParams);
  }

  private async offsetPaginationImport(impt: ApiImport, transfer: Transfer) {
    // const { paginationOptions, datasetsPath } = impt;
    // const { limitValue } = paginationOptions;
    // const apiConnector = new ApiConnector(impt);
    // await apiConnector.authRequest();
    // const offsetPaginationTransferParams: OffsetPaginationTransferParams = {
    //   import: impt,
    //   transfer,
    //   limitPerStep: limitValue,
    //   paginationFunction: {
    //     fn: this.offetPaginationFunction,
    //     params: [apiConnector, datasetsPath]
    //   }
    // };
    // await this.offsetPaginationTransferHelper.transfer(
    //   offsetPaginationTransferParams
    // );
  }

  private async cursorPaginationImport(impt: ApiImport, transfer: Transfer) {
    // const { paginationOptions, datasetsPath } = impt;
    // const { limitValue, cursorPath } = paginationOptions;
    // const apiConnector = new ApiConnector(impt);
    // await apiConnector.authRequest();
    // const cursorPaginationTransferParams: CursorPaginationTransferParams = {
    //   import: impt,
    //   transfer,
    //   limitPerStep: limitValue,
    //   paginationFunction: {
    //     fn: this.cursorPaginationFunction,
    //     params: [apiConnector, cursorPath, datasetsPath]
    //   }
    // };
    // await this.cursorPaginationTransferHelper.transfer(
    //   cursorPaginationTransferParams
    // );
  }

  // private offetPaginationFunction: OffsetPaginationFunction = async (
  //   offsetPagination: OffsetPagination,
  //   apiConnector: ApiConnector,
  //   datasetsPath: string
  // ) => {
  //   apiConnector.paginateRequest(offsetPagination);
  //   const data = await apiConnector.sendRequest();
  //   return resolvePath(data, datasetsPath) as object[];
  // };

  // private cursorPaginationFunction: CursorPaginationFunction = async (
  //   cursorPagination: CursorPagination,
  //   apiConnector: ApiConnector,
  //   cursorPath: string,
  //   datasetsPath: string
  // ) => {
  //   apiConnector.paginateRequest(cursorPagination);
  //   const data = await apiConnector.sendRequest();
  //   const cursor = resolvePath(data, cursorPath) as unknown as string;
  //   const datasets = resolvePath(data, datasetsPath) as object[];
  //   return {
  //     cursor,
  //     datasets
  //   };
  // };
}
