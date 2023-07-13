import ApiConnector from './connector/api-connector';
import IPagination from '../transfer/interfaces/pagination.interface';
import { IImport } from '../imports/import.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import { IColumn } from '../columns/interfaces/column.interface';

class ApiColumnsService {
  public async find(
    impt: Omit<IImport, 'fields'>
  ): Promise<IColumn[] | string> {
    try {
      const { api } = impt;
      const { transferType, request, idColumn } = api;

      const apiConnector = new ApiConnector(request);
      await apiConnector.authorizeRequest();

      let response: object[] = [];
      switch (transferType) {
        case TransferType.CHUNK: {
          response = await apiConnector.send();
          break;
        }
        case TransferType.PAGINATION: {
          const pagination: IPagination = {
            offset: 0,
            limit: 1
          };
          response = await apiConnector.send(pagination);
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

      const columns: IColumn[] = this.findNestedObjectTypes(dataset);
      return columns;
    } catch (error) {
      throw new Error(
        `Error while searching columns for API: ${error.message}`
      );
    }
  }

  private findNestedObjectTypes(obj: any): any {
    if (typeof obj === 'object'  && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key] = this.findNestedObjectTypes(value);
        return acc;
      }, {});
    } else {
      return typeof obj;
    }
  }

  public async checkIdColumnUniqueness(impt: Omit<IImport, 'fields'>) {
    try {
      const { api } = impt;
      const { transferType, request, idColumn } = api;

      const apiConnector = new ApiConnector(request);
      await apiConnector.authorizeRequest();

      switch (transferType) {
        case TransferType.CHUNK: {
          const response = await apiConnector.send();
          return this.isUnique(response, idColumn);
        }
        case TransferType.PAGINATION: {
          return true;
        }
        // case TransferType.STREAM: {
        //   response = await this.findStreamColumns(api);
        //   break;
        // }
        default: {
          throw new Error('Unknown transfer type.');
        }
      }
    } catch (error) {
      throw new Error(
        `Error while checking column uniqueness: ${error.message}`
      );
    }
  }

  private isUnique(array: object[], idColumn: string) {
    var uniqueValues = [];

    array.forEach(function (object) {
      if (!uniqueValues.includes(object)) {
        uniqueValues.push(object[idColumn]);
      }
    });

    return uniqueValues.length === array.length;
  }

  // private async streamRequest(api: IApi) {
  //   const apiConnector = new ApiConnector(api);
  //   const stream = (await apiConnector.send()) as unknown as ReadStream;
  //   const datasets = await new Promise((resolve) => {
  //     stream.on('data', (chunk) => {
  //       stream.destroy();
  //       apiConnector.abort();
  //       const datasets = JSON.parse(chunk.toString());
  //       resolve(datasets);
  //     });
  //   });
  //   return datasets as object[];
  // }
}

export default ApiColumnsService;
