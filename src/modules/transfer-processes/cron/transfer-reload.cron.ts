// import { CronJob } from 'cron';

// import { TransferProcessesRepository } from '../transfer-processes.repository';
// import { SocketHelper } from '../../sockets/socket.helper';

// export class TransferCron {
//   private job: CronJob;

//   constructor(
//     private transfersRepository: TransferProcessesRepository,
//     private socketHelper: SocketHelper,
//   ) {}
  
//   public init() {
//     this.job = new CronJob('*/1 * * * *', async () => {
//         try {
//           const activeSchedulers = await this.getActiveSchedulers();
//           const readyImports = this.getReadyImports(activeSchedulers);
//           this.startImports(readyImports);
//         } catch (error) {
//           console.log(`Error while cron: ${error}`);
//         }
//       });
//   }

//   private get

// }
