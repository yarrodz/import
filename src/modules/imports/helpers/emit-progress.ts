import Websocket from '../../../utils/websocket/websocket';

import { IImportProcessModel } from '../../import-processes/import-process.schema';

export default function emitProgress(
  io: Websocket,
  processId: string,
  importProcess: IImportProcessModel
) {
  io.of('processes').to(processId).emit('progress', { data: importProcess });
}
