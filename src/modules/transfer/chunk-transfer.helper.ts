import { Server as IO } from 'socket.io';

import TransferStepHelper from './transfer-step.helper';
import ImportProcessesRepository from '../import-processes/import-processes.repository';
import { ImportStatus } from '../import-processes/enums/import-status.enum';
import { IImportDocument } from '../imports/import.schema';

class ChunkTransferHelper {
  private io: IO;
  private transferStepHelper: TransferStepHelper;
  private importProcessesRepository: ImportProcessesRepository;

  constructor(
    io: IO,
    transferStepHelper: TransferStepHelper,
    importProcessesRepository: ImportProcessesRepository
  ) {
    this.io = io;
    this.transferStepHelper = transferStepHelper;
    this.importProcessesRepository = importProcessesRepository;
  }

  public async chunkTransfer(
    impt: IImportDocument,
    processId: string,
    chunkedDatasets: object[][]
  ) {
    while (chunkedDatasets.length) {
      const refreshedProcess = await this.importProcessesRepository.findById(
        processId
      );
      if (refreshedProcess.status === ImportStatus.PAUSED) {
        this.io
          .to(processId.toString())
          .emit('importProcess', refreshedProcess);
        return;
      }
      const chunk = chunkedDatasets.shift();
      await this.transferStepHelper.transferStep(impt, processId, chunk);
    }

    const completedProcess = await this.importProcessesRepository.update(
      processId,
      {
        status: ImportStatus.COMPLETED,
        errorMessage: null
      }
    );
    this.io.to(processId.toString()).emit('importProcess', completedProcess);
  }
}

export default ChunkTransferHelper;

// public async streamTransfer(
//   impt: IImportDocument,
//   processId: string,
//   idColumn: string,
//   readable: ReadStream
// ) {
//   for await (const chunk of readable) {
//     const refreshedProcess = await this.importProcessesRepository.findById(
//       processId
//     );
//     if (refreshedProcess.status === ImportStatus.PAUSED) {
//       this.io
//         .to(processId.toString())
//         .emit('importProcess', refreshedProcess);
//       return;
//     }

//     let chunks = chunk.toString().split('][');
//     let parsedChunks = chunks.map((chunk) => JSON.parse(chunks));
//     const parsedChunk = parsedChunks[0];

//     const transormedDatasets = await this.transformDatasets(
//       impt,
//       processId,
//       parsedChunk,
//       idColumn
//     );

//     await this.insertDatasets(transormedDatasets);

//     const updatedProcess = await this.importProcessesRepository.update(
//       processId,
//       {
//         attempts: 0,
//         errorMessage: null,
//         $inc: {
//           processedDatasetsCount: parsedChunk.length,
//           transferedDatasetsCount: transormedDatasets.length
//         }
//       }
//     );

//     this.io.to(processId.toString()).emit('importProcess', updatedProcess);
//   }
//   const completedProcess = await this.importProcessesRepository.update(
//     processId,
//     {
//       status: ImportStatus.COMPLETED,
//       errorMessage: null
//     }
//   );
//   this.io.to(processId.toString()).emit('importProcess', completedProcess);
// }
