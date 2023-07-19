import ApiConnector from './connector/api-connector';
import { IImport, IImportDocument } from '../imports/import.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import { IColumn } from '../columns/column.interface';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';
import ICursorPagination from '../transfer/interfaces/cursor-pagination.interface';
import resolvePath from '../../utils/resolve-path/resolve-path';

class ApiColumnsHelper {
  public async find(impt: IImportDocument): Promise<IColumn[] | string> {
    try {
      const { api, idColumn } = impt;
      const { transferType, datasetsPath } = api;

      const apiConnector = new ApiConnector(api);
      await apiConnector.authorizeRequest();

      let response: object[] = [];
      switch (transferType) {
        case TransferType.CHUNK: {
          response = await apiConnector.send();
          break;
        }
        case TransferType.OFFSET_PAGINATION: {
          const pagination: IOffsetPagination = {
            offset: 0,
            limit: 1
          };
          response = await apiConnector.send(pagination);
          break;
        }
        case TransferType.CURSOR_PAGINATION: {
          const pagination: ICursorPagination = {
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

      const datasets = resolvePath(response, datasetsPath);
      const dataset = datasets[0];
      const columns: IColumn[] = this.findNestedObjectTypes(dataset);
      return columns;
    } catch (error) {
      throw new Error(
        `Error while searching columns for API: ${error.message}`
      );
    }
  }

  public async checkIdColumnUniqueness(impt: Omit<IImport, 'fields'>) {
    try {
      const { api, idColumn } = impt;
      const { transferType, datasetsPath } = api;

      const apiConnector = new ApiConnector(api);
      await apiConnector.authorizeRequest();

      switch (transferType) {
        case TransferType.CHUNK: {
          const response = await apiConnector.send();
          const datasets = resolvePath(response, datasetsPath) as object[];
          return this.checkKeyValuesUniqueness(datasets, idColumn);
        }
        case TransferType.OFFSET_PAGINATION: {
          return true;
        }
        case TransferType.CURSOR_PAGINATION: {
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

  private findNestedObjectTypes(obj: any): any {
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key] = this.findNestedObjectTypes(value);
        return acc;
      }, {});
    } else {
      return typeof obj;
    }
  }

  private checkKeyValuesUniqueness(array: object[], key: string) {
    var uniqueValues = [];

    array.forEach(function (object) {
      if (!uniqueValues.includes(object)) {
        uniqueValues.push(object[key]);
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

export default ApiColumnsHelper;
