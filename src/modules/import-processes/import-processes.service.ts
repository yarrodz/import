// import { Types } from 'mongoose';

// import ImportProcess, { IImportProcess, IImportProcessModel } from './import-process.schema';
// import Websocket from '../../utils/websocket/websocket';

// class ImportProcessesService {
//   async update(id: Types.ObjectId, attrs: Partial<IImportProcess>) {
//     const process = await ImportProcess.findByIdAndUpdate(id, attrs);
//   }

//   private async updateSocket(process: IImportProcessModel) {
//     const io = Websocket.getInstance();
//     io.of('orders').emit('process_updated', { data: process });
//   }
// }

// export default new ImportProcessesService();
