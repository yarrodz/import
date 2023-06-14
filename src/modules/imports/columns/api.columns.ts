import axios from 'axios';

import { resolvePath } from '../helpers/resolve-path';
import { IColumn } from '../intefaces/column.interface';
import { ConnectInput } from '../inputs/connect.input';

export async function receiveApiColumns(
  connectInput: ConnectInput
): Promise<IColumn[]> {
  const config = connectInput.api.config;
  const path = connectInput.api.path;

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
