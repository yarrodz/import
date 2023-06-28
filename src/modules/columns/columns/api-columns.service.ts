import { buildRequest } from '../../../utils/api/request-builder';
import {
  sendRequest
} from '../../../utils/api/request-sender';
import { IImport } from '../../imports/import.schema';
import { IColumn } from '../interfaces/column.interface';

class APIColumnsService {
  public async find(impt: Omit<IImport, 'fields'>): Promise<IColumn[]> {
    const requestConfig = impt.api.requestConfig;
    const path = impt.api.path;
    const idColumn = impt.api.idColumn;

    const request = buildRequest(impt.api);
    const response = await sendRequest(request, path);

    const dataset = response[0];
    if (dataset[idColumn] === undefined) {
      throw new Error('Id column is not present in dataset');
    }

    const columns: IColumn[] = Object.entries(dataset).map(([key, value]) => {
      return {
        name: key,
        type: typeof value
      };
    });
    return columns;
  }

  public checkIdColumnUniqueness(impt: Omit<IImport, 'fields'>) {
    return true;
  }
}

export default APIColumnsService;
