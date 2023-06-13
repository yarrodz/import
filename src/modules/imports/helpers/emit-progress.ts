import Websocket from '../../../utils/websocket/websocket';

import { IImportProcessModel } from '../../import-processes/import-process.schema';

export default function emitProgress(
  io: Websocket,
  unit: string,
  importProcess: IImportProcessModel
) {
  io.of('processes').to(unit).emit('progress', { data: importProcess });
}
