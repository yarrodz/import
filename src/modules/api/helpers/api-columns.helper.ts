import { ApiConnector } from '../connector/api-connector';
import { resolvePath } from '../../../utils/resolve-path/resolve-path';
import { Column } from '../../transfers/interfaces/column.interface';
import { TransferMethod } from '../../transfer-processes/enums/transfer-method.enum';
import { ApiIframeTransfer } from '../interfaces/api-iframe-transfer.interface';
import { baseOffsetPagination } from '../../transfer-processes/constants/base-offset-pagination.constant';
import { baseCursorPagination } from '../../transfer-processes/constants/base-cursor-pagination.constnt';
import { Pagination } from '../../transfer-processes/interfaces/pagination.type';

export class ApiColumnsHelper {
  public async get(transfer: ApiIframeTransfer): Promise<Column[]> {
    try {
      const { transferMethod, datasetsPath } = transfer;

      const apiConnector = new ApiConnector(transfer);
      await apiConnector.authRequest();

      const cases = {
        [TransferMethod.OFFSET_PAGINATION]: baseOffsetPagination,
        [TransferMethod.CURSOR_PAGINATION]: baseCursorPagination
      };
      const pagination: Pagination = cases[transferMethod];
      apiConnector.paginateRequest(pagination);
      const response = await apiConnector.sendRequest();

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
}


// case TransferMethod.CHUNK: {
        //   response = await apiConnector.sendRequest();
        //   break;
        // }

        
  // public async checkIdColumnUniqueness(transfer: ApiIframeTransfer) {
  //   try {
  //     const { transferMethod, datasetsPath, idKey } = transfer;

  //     const apiConnector = new ApiConnector(transfer);
  //     await apiConnector.authRequest();

  //     switch (transferMethod) {
  //       case TransferMethod.CHUNK: {
  //         const response = await apiConnector.sendRequest();
  //         const datasets = resolvePath(response, datasetsPath) as object[];
  //         return this.checkKeyValuesUniqueness(datasets, idKey);
  //       }
  //       case TransferMethod.OFFSET_PAGINATION: {
  //         return true;
  //       }
  //       case TransferMethod.CURSOR_PAGINATION: {
  //         return true;
  //       }
  //       default: {
  //         throw new Error(`Unknown transfer method: ${transferMethod}`);
  //       }
  //     }
  //   } catch (error) {
  //     throw new Error(
  //       `Error while checking column uniqueness: ${error.message}`
  //     );
  //   }
  // }

  // private checkKeyValuesUniqueness(array: object[], key: string) {
  //   const uniqueValues = [];

  //   array.forEach(function (object) {
  //     if (!uniqueValues.includes(object)) {
  //       uniqueValues.push(object[key]);
  //     }
  //   });

  //   return uniqueValues.length === array.length;
  // }