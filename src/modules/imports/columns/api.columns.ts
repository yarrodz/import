import axios from 'axios';

import { IImportModel } from '../import.schema';
import { resolvePath } from '../helpers/resolve-path';
import { IColumn } from '../intefaces/column.interface';

export async function receiveApiColumns(imp: IImportModel): Promise<IColumn[]> {
  const config = imp.api.config;
  const path = imp.api.path;

  const data = await axios(config);
  const dataset = resolvePath(data, path)[0] as object;

  const columns: IColumn[] = Object.entries(dataset).map(([key, value]) => {
    return {
      name: key,
      type: typeof value
    };
  });
  return columns;
}
