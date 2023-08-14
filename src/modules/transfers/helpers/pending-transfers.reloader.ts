// import SqlTransferHelper from '../../sql/helpers/sql-import.helper';
// import ApiTransferHelper from '../../api/helpers/api-import.helper';
// import TransfersRepository from '../transfers.repository';
// import SynchronizationsRepository from '../../synchronizations/synchronizations.repository';
// import { TransferStatus } from '../enums/transfer-status.enum';
// import { SynchronizationSource } from '../../synchronizations/enums/synchronization-source.enum';

// class PendingTransfersReloader {
//   sqlTransferHelper: SqlTransferHelper;
//   apiTransferHelper: ApiTransferHelper;
//   transfersRepository: TransfersRepository;
//   synchronizationsRepository: SynchronizationsRepository;

//   constructor(
//     sqlTransferHelper: SqlTransferHelper,
//     apiTransferHelper: ApiTransferHelper
//   ) {
//     this.sqlTransferHelper = sqlTransferHelper;
//     this.apiTransferHelper = apiTransferHelper;
//     this.transfersRepository = new TransfersRepository();
//     this.synchronizationsRepository = new SynchronizationsRepository();
//   }

//   async reload() {
//     const pendingTransfers = await this.transfersRepository.getAll({
//       status: TransferStatus.PENDING
//     });

//     await Promise.all(
//       pendingTransfers.map(async (transfer) => {
//         try {
//           const synchronizationId = transfer._ref.inSynchronization;

//           const synchronization = await this.synchronizationsRepository.getOne(
//             synchronizationId
//           );
//           const { source } = synchronization;

//           //To do add checks if transfer import or export
//           switch (source) {
//             case SynchronizationSource.SQL: {
//               await this.sqlTransferHelper.import(synchronization, transfer);
//               break;
//             }
//             case SynchronizationSource.API: {
//               await this.apiTransferHelper.import(synchronization, transfer);
//               break;
//             }
//             default: {
//               console.error(
//                 `Error while reloading pending transfers: Unknown synchronization source: '${source}'.`
//               );
//             }
//           }
//         } catch (error) {
//           console.error(`Error while reloading pending transfers: ${error}.`);
//         }
//       })
//     );
//   }
// }

// export default PendingTransfersReloader;
