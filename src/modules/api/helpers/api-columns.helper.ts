import ApiConnector from '../connector/api-connector';
import resolvePath from '../../../utils/resolve-path/resolve-path';
import Column from '../../columns/column.interface';
import ApiImport from '../interfaces/api-import.interface';
import { TransferMethod } from '../../transfers/enums/transfer-method.enum';
import OffsetPagination from '../../transfers/interfaces/offset-pagination.interface';
import CursorPagination from '../../transfers/interfaces/cursor-pagination.interface';

class ApiColumnsHelper {
  public async find(impt: ApiImport): Promise<Column[]> {
    try {
      const { transferMethod, datasetsPath } = impt;

      const apiConnector = new ApiConnector(impt);
      await apiConnector.authRequest();

      let response: any;
      switch (transferMethod) {
        case TransferMethod.CHUNK: {
          response = await apiConnector.sendRequest();
          break;
        }
        case TransferMethod.OFFSET_PAGINATION: {
          const pagination: OffsetPagination = {
            offset: 0,
            limit: 1
          };
          apiConnector.paginateRequest(pagination);
          response = await apiConnector.sendRequest();
          break;
        }
        case TransferMethod.CURSOR_PAGINATION: {
          const pagination: CursorPagination = {
            limit: 1
          };
          apiConnector.paginateRequest(pagination);
          response = await apiConnector.sendRequest();
          break;
        }
        default: {
          throw new Error(
            `Error wlile searching for columns. Unknown transfer method: '${transferMethod}'.`
          );
        }
      }

      const datasets = resolvePath(response, datasetsPath);
      const dataset = datasets[0];
      const columns: Column[] = this.findNestedObjectTypes(dataset);
      return columns;
    } catch (error) {
      throw new Error(
        `Error while searching columns for API: ${error.message}`
      );
    }
  }

  public async checkIdColumnUniqueness(impt: ApiImport) {
    try {
      const { transferMethod, datasetsPath, idKey } = impt;

      const apiConnector = new ApiConnector(impt);
      await apiConnector.authRequest();

      switch (transferMethod) {
        case TransferMethod.CHUNK: {
          const response = await apiConnector.sendRequest();
          const datasets = resolvePath(response, datasetsPath) as object[];
          return this.checkKeyValuesUniqueness(datasets, idKey);
        }
        case TransferMethod.OFFSET_PAGINATION: {
          return true;
        }
        case TransferMethod.CURSOR_PAGINATION: {
          return true;
        }
        default: {
          throw new Error(`Unknown transfer method: ${transferMethod}`);
        }
      }
    } catch (error) {
      throw new Error(
        `Error while checking column uniqueness: ${error.message}`
      );
    }
  }

  private findNestedObjectTypes(obj: any): Column[] {
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const type = typeof value;
        const column: Column = {
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
