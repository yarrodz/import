import IPagination from '../../transfer/interfaces/pagination.interface';
import ApiConnection from '../../api/connection/api-connection';
import { IImport } from '../../imports/import.schema';
import { TransferType } from '../../transfer/enums/transfer-type.enum';
import { IColumn } from '../interfaces/column.interface';
import { IRequest } from '../../api/sub-schemas/request.schema';

class APIColumnsService {
  public async find(
    impt: Omit<IImport, 'fields'>,
    token?: string
  ): Promise<IColumn[] | string> {
    const { api } = impt;
    const { transferType, request, idColumn } = api;

    let response: object[] = [];

    switch (transferType) {
      case TransferType.CHUNK: {
        response = await this.chunkRequest(request, token);
        break;
      }
      case TransferType.PAGINATION: {
        response = await this.paginationReqest(request, token);
        break;
      }
      // case TransferType.STREAM: {
      //   response = await this.findStreamColumns(api);
      //   break;
      // }
      default: {
        throw new Error(
          'Error wlile searching for columns. Unknown transfer type.'
        );
      }
    }

    const dataset = response[0];
    if (dataset[idColumn] === undefined) {
      throw new Error('Id column is not present in dataset');
    }

    const columns: IColumn[] = Object.entries(dataset).map(([key, value]) => {
      let type: any;
      if (typeof value === 'object') {
        type = Object.entries(value).reduce((acc, [k, v]) => {
          acc[k] = typeof v;
          return acc;
        }, {});
      } else {
        type = typeof value;
      }
      return {
        name: key,
        type
      };
    });
    return columns;
  }

  public checkIdColumnUniqueness(impt: Omit<IImport, 'fields'>) {
    return true;
  }

  private async chunkRequest(request: IRequest, token?: string) {
    const apiConnection = new ApiConnection(request);
    await apiConnection.authorizeRequest(token);
    return await apiConnection.send();
  }

  private async paginationReqest(request: IRequest, token?: string) {
    const pagination: IPagination = {
      offset: 0,
      limit: 1
    };
    const apiConnection = new ApiConnection(request);
    await apiConnection.authorizeRequest(token);
    return await apiConnection.send(pagination);
  }

  // private async streamRequest(api: IApi) {
  //   const apiConnection = new ApiConnection(api);
  //   const stream = (await apiConnection.send()) as unknown as ReadStream;
  //   const datasets = await new Promise((resolve) => {
  //     stream.on('data', (chunk) => {
  //       stream.destroy();
  //       apiConnection.abort();
  //       const datasets = JSON.parse(chunk.toString());
  //       resolve(datasets);
  //     });
  //   });
  //   return datasets as object[];
  // }
}

export default APIColumnsService;
