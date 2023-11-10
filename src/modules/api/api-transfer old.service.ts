// import { Request } from 'express';

// import { ProcessesRepository } from '../processes/process.repository';
// import { TransfersRepository } from '../transfer-processes/transfer-processes.repository';
// import { ApiConnectionHelper } from './helpers/api-connection.helper';
// import { ApiImportHelper } from './helpers/api-import.helper';
// import { OAuth2AuthUriHelper } from '../oauth2/helpers/oauth2-auth-uri.helper';
// import { ResponseHandler } from '../../utils/response-handler/response-handler';
// import { ApiImport } from './interfaces/api-iframe-transfer.interface';
// import { Transfer } from '../transfer-processes/interfaces/transfer-process.interface';
// import { Connectionstatus } from './enums/connection-status.enum';
// // import { TransferStatus } from '../transfers/enums/transfer-status.enum';
// import { Context } from '../oauth2/interfaces/context.interface';
// import { ContextAction } from '../oauth2/enums/context-action-enum';
// import { ApiConnection } from './interfaces/api-connection.interface';

// export class ApiTransferService {
//   private apiConnectionHelper: ApiConnectionHelper;
//   private apiImportHelper: ApiImportHelper;
//   private oAuth2AuthUriHelper: OAuth2AuthUriHelper;
//   private processesRepository: ProcessesRepository;
//   private transfersRepository: TransfersRepository;

//   constructor(
//     apiConnectionHelper: ApiConnectionHelper,
//     apiImportHelper: ApiImportHelper,
//     oAuth2AuthUriHelper: OAuth2AuthUriHelper,
//     processesRepository: ProcessesRepository,
//     transfersRepository: TransfersRepository
//   ) {
//     this.apiConnectionHelper = apiConnectionHelper;
//     this.apiImportHelper = apiImportHelper;
//     this.oAuth2AuthUriHelper = oAuth2AuthUriHelper;
//     this.processesRepository = processesRepository;
//     this.transfersRepository = transfersRepository;
//   }

//   async reload(
//     req: Request,
//     impt: ApiImport,
//     transfer: Transfer
//   ): Promise<ResponseHandler> {
//     const responseHandler = new ResponseHandler();
//     try {
//       const { id: importId } = impt;
//       const connection = impt.__.hasConnection as ApiConnection;
//       const { id: connectionId } = connection;
//       const { id: transferId } = transfer;

//       const context: Context = {
//         action: ContextAction.RELOAD,
//         connectionId,
//         importId,
//         transferId
//       };
//       const connectionstatus = await this.apiConnectionHelper.connect(impt);
//       if (connectionstatus === Connectionstatus.OAUTH2_REQUIRED) {
//         const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
//           req,
//           connection,
//           context
//         );
//         responseHandler.setSuccess(201, oAuth2AuthUri);
//         return responseHandler;
//       }

//       const updatedImport = await this.processesRepository.load(importId);

//       const reloadedTransfer = await this.transfersRepository.update({
//         id: transferId
//         // status: TransferStatus.PENDING
//       });

//       this.apiImportHelper.import({
//         import: updatedImport,
//         transfer: reloadedTransfer
//       });
//       responseHandler.setSuccess(200, transferId);
//       return responseHandler;
//     } catch (error) {
//       responseHandler.setError(500, error.message);
//       return responseHandler;
//     }
//   }

//   async retry(
//     req: Request,
//     impt: ApiImport,
//     transfer: Transfer
//   ): Promise<ResponseHandler> {
//     const responseHandler = new ResponseHandler();
//     try {
//       const { id: importId } = impt;
//       const connection = impt.__.hasConnection as ApiConnection;
//       const { id: connectionId } = connection;
//       const { id: transferId } = transfer;

//       const context: Context = {
//         action: ContextAction.RETRY,
//         connectionId,
//         importId,
//         transferId
//       };
//       const connectionstatus = await this.apiConnectionHelper.connect(impt);
//       if (connectionstatus === Connectionstatus.OAUTH2_REQUIRED) {
//         const oAuth2AuthUri = await this.oAuth2AuthUriHelper.createUri(
//           req,
//           connection,
//           context
//         );
//         responseHandler.setSuccess(201, oAuth2AuthUri);
//         return responseHandler;
//       }

//       const updatedImport = await this.processesRepository.load(importId);

//       // const retriedTransfer = await this.transfersRepository.update({
//       //   id: transferId,
//       //   retryAttempts: 0,
//       //   status: TransferStatus.PENDING
//       // });

//       this.apiImportHelper.import({
//         import: updatedImport,
//         transfer: transfer
//       });
//       responseHandler.setSuccess(200, transferId);
//       return responseHandler;
//     } catch (error) {
//       responseHandler.setError(500, error.message);
//       return responseHandler;
//     }
//   }
// }

// export default ApiTransferService;
