import axios from 'axios';

import { IImport } from '../import.schema';
import { resolvePath } from '../helpers/resolve-path';
import { IColumn } from '../intefaces/column.interface';

export async function receiveApiColumns(
  impt: Omit<IImport, 'fields'>
): Promise<IColumn[]> {
  const requestConfig = impt.api.requestConfig;
  const path = impt.api.path;

  const data = await axios(requestConfig);
  const dataset = resolvePath(data, path)[0] as object;

  const columns: IColumn[] = Object.entries(dataset).map(([key, value]) => {
    return {
      name: key,
      type: typeof value
    };
  });
  return columns;
}
