// import { Server as IO } from 'socket.io';
// import { Types } from 'mongoose';

// import ImportsRepository from '../imports/imports.repository';
// import ImportProcessesRepository from '../import-processes/import-processes.repository';
// import SqlTranserService from '../database/sql-transfer.service';
// import ApiTransferService from '../api/api-transfer.service';
// import { IImportDocument } from '../imports/import.schema';
// import { IImportProcessDocument } from '../import-processes/import-process.schema';
// import { ImportSource } from '../imports/enums/import-source.enum';
// import { ImportStatus } from '../import-processes/enums/import-status.enum';
// import ConnectionService from '../connection/connection.service';
// import { ConnectionState } from '../connection/enums/connection-state.enum';

// class TransferService {
//   private io: IO;
//   private importsRepository: ImportsRepository;
//   private importProcessesRepository: ImportProcessesRepository;
//   private connectionService: ConnectionService;
//   private sqlTranserService: SqlTranserService;
//   private apiTransferService: ApiTransferService;
//   private maxAttempts: number;
//   private attemptDelayTime: number;

//   constructor(
//     io: IO,
//     importsRepository: ImportsRepository,
//     importProcessesRepository: ImportProcessesRepository,
//     connectionService: ConnectionService,
//     sqlTranserService: SqlTranserService,
//     apiTransferService: ApiTransferService,
//     maxAttempts: number,
//     attemptDelayTime: number
//   ) {
//     (this.io = io), (this.importsRepository = importsRepository);
//     this.importProcessesRepository = importProcessesRepository;
//     this.connectionService = connectionService;
//     this.sqlTranserService = sqlTranserService;
//     this.apiTransferService = apiTransferService;
//     this.maxAttempts = maxAttempts;
//     this.attemptDelayTime = attemptDelayTime;
//   }

//   public async transfer(
//     importId: string | Types.ObjectId,
//     processId: string | Types.ObjectId
//   ): Promise<void> {
//     const impt = await this.importsRepository.findById(importId);
//     const process = await this.importProcessesRepository.findById(processId);
//     try {
//       await this.run(impt, process);
//     } catch (error) {
//       return this.handleTranserFailure(error, impt, process);
//     }
//   }

//   private async run(
//     impt: IImportDocument,
//     process: IImportProcessDocument
//   ): Promise<void> {
//     const { source } = impt;
//     switch (source) {
//       case ImportSource.MYSQL:
//       case ImportSource.POSTGRESQL:
//       case ImportSource.MICROSOFT_SQL_SERVER:
//       case ImportSource.ORACLE:
//       case ImportSource.MARIADB:
//         await this.sqlTranserService.transfer(impt, process);
//         break;
//       case ImportSource.API:
//         await this.apiTransferService.transfer(impt, process);
//         break;
//       // case ImportSource.IMAP:
//       //   await imapImport(impt, processId);
//       //   break;
//       default:
//         throw new Error('Unexpected import source');
//     }
//   }

//   private async handleTranserFailure(
//     error: Error,
//     impt: IImportDocument,
//     process: IImportProcessDocument
//   ): Promise<void> {
//     const { _id: importId } = impt;
//     const { _id: processId } = process;

//     const connectionState = await this.connectionService.connect(importId);
//     if (connectionState === ConnectionState.OAUTH2_REQUIRED) {
//       await this.importProcessesRepository.update(processId, {
//         status: ImportStatus.PAUSED
//       });
//       return;
//     }

//     switch (process.attempts) {
//       case this.maxAttempts:
//         await this.failTransferProcess(error, process);
//         break;
//       default:
//         await this.retryTransferProcess(impt, process);
//         break;
//     }
//   }

//   private async failTransferProcess(
//     error: Error,
//     process: IImportProcessDocument
//   ): Promise<void> {
//     const failedProcess = await this.importProcessesRepository.update(
//       process._id,
//       {
//         status: ImportStatus.FAILED,
//         errorMessage: error.message
//       }
//     );
//     this.io.to(process._id.toString()).emit('importProcess', failedProcess);
//   }

//   private async retryTransferProcess(
//     impt: IImportDocument,
//     process: IImportProcessDocument
//   ): Promise<void> {
//     const { _id: importId } = impt;
//     const { _id: processId } = process;
//     await this.importProcessesRepository.update(processId, {
//       $inc: { attempts: 1 }
//     });
//     await this.delayAttempt();
//     return await this.transfer(importId, processId);
//   }

//   private async delayAttempt(): Promise<void> {
//     return new Promise((resolve) => {
//       setTimeout(() => resolve(undefined), this.attemptDelayTime);
//     });
//   }
// }

// export default TransferService;
