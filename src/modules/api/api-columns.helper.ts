import ApiConnector from './connector/api-connector';
import { IImportDocument } from '../imports/import.schema';
import { TransferType } from '../transfer/enums/transfer-type.enum';
import { IColumn } from '../columns/column.interface';
import IOffsetPagination from '../transfer/interfaces/offset-pagination.interface';
import ICursorPagination from '../transfer/interfaces/cursor-pagination.interface';
import resolvePath from '../../utils/resolve-path/resolve-path';

class ApiColumnsHelper {
  public async find(impt: IImportDocument): Promise<IColumn[]> {
    try {
      const { api } = impt;
      const { transferType, datasetsPath } = api;

      const apiConnector = new ApiConnector(api);
      await apiConnector.authorizeRequest();

      let response: object;
      switch (transferType) {
        case TransferType.CHUNK: {
          response = await apiConnector.sendRequest();
          break;
        }
        case TransferType.OFFSET_PAGINATION: {
          const pagination: IOffsetPagination = {
            offset: 0,
            limit: 1
          };
          apiConnector.paginateRequest(pagination);
          response = await apiConnector.sendRequest();
          break;
        }
        case TransferType.CURSOR_PAGINATION: {
          const pagination: ICursorPagination = {
            limit: 1
          };
          apiConnector.paginateRequest(pagination);
          response = await apiConnector.sendRequest();
          break;
        }
        default: {
          throw new Error(
            `Error wlile searching for columns. Unknown transfer type: '${transferType}'.`
          );
        }
      }

      const datasets = resolvePath(response, datasetsPath);
      // console.log("datasets: ", datasets);
      const dataset = datasets[0];
      // console.log('dateset: ', dataset)
      const columns: IColumn[] = this.findNestedObjectTypes(dataset);
      return columns;
    } catch (error) {
      throw new Error(
        `Error while searching columns for API: ${error.message}`
      );
    }
  }

  public async checkIdColumnUniqueness(impt: IImportDocument) {
    try {
      const { api, idColumn } = impt;
      const { transferType, datasetsPath } = api;

      const apiConnector = new ApiConnector(api);
      await apiConnector.authorizeRequest();

      switch (transferType) {
        case TransferType.CHUNK: {
          const response = await apiConnector.sendRequest();
          const datasets = resolvePath(response, datasetsPath) as object[];
          return this.checkKeyValuesUniqueness(datasets, idColumn);
        }
        case TransferType.OFFSET_PAGINATION: {
          return true;
        }
        case TransferType.CURSOR_PAGINATION: {
          return true;
        }
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

  private findNestedObjectTypes(obj: any): IColumn[] {
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const type = typeof value;
        const column: IColumn = {
          name: key,
          type:
            type === 'object' && value !== null
              ? this.findNestedObjectTypes(value)
              : type
        };

        if (column.name !== '') {
          acc.push(column);
        }
        return acc;
      }, []);
    } else {
      return [];
    }
  }

  private checkKeyValuesUniqueness(array: object[], key: string) {
    const uniqueValues = [];

    array.forEach(function (object) {
      if (!uniqueValues.includes(object)) {
        uniqueValues.push(object[key]);
      }
    });

    return uniqueValues.length === array.length;
  }
}

export default ApiColumnsHelper;
