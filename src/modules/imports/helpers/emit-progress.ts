import Websocket from '../../../utils/websocket/websocket';
import { IImportProcessDocument } from '../../import-processes/import-process.schema';

export default function emitProgress(
  io: Websocket,
  processId: string,
  importProcess: IImportProcessDocument
) {
  io.of('processes').to(processId).emit('progress', { data: importProcess });
}
