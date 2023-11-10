// // to do: get transfer from update;
// import { TransfersRepository } from '../transfers.repository';
// import { SocketHelper } from '../../sockets/socket.helper';
// import { TransferProps } fro../interfaces/transfer-params.interaceace';
// import { Transfer } from '../interfaces/transfer.interface';
// import { TransferStatus } from '../enums/transfer-status.enum';  
// import { PaginationType } from '../enums/pagination-type.enum';
// import { Pagination } fro../interfaces/pagination.typeype';
// import { sleep } from '../../../utils/sleep/sleep';

// export class TransferHelper {
//   private transfersRepository: TransfersRepository;
//   private socketHelper: SocketHelper;

//   private props?: TransferProps;

//   constructor(
//     transfersRepository: TransfersRepository,
//     socketHelper: SocketHelper,
//   ) {
//     this.transfersRepository = transfersRepository;
//     this.socketHelper = socketHelper;
//   }

//   public async doTransfer(props: TransferProps) {
//     this.setProps(props)

//     await this.transferLoop();
    
//     this.completeTrandsfer();
//   }

//   private setProps(props: TransferProps) {
//     for (const [key, value] of Object.entries(props)) {
//       this.props[key] = value;
//     }
//   }

//   private async transferLoop() {
//     let stepCount = 0;
//     const totalSteps = 
//     while (stepCount < 10000) {
//       stepCount += await this.intervalLoop();
//     }
//     this.pauseTransfer();
//   }

//   async intervalLoop() {
//     const { limitRequestsPerSecond: limitStepsPerSecond } = this.props;
//     let sumStepTime = 0;
//     let stepCount = 0;

//     while (stepCount < limitStepsPerSecond && sumStepTime < 1000) {
//       stepCount++;
//       sumStepTime += await this.runStepAndReturnTime();
//     }

//     if (sumStepTime < 1000) {
//       const remainingToSecond = 1000 - sumStepTime;
//       await sleep(remainingToSecond);
//     }

//     return stepCount;
//   }

//   async runStepAndReturnTime() {
//     const stepStart = new Date();
//     await this.transferStep();
//     const stepEnd = new Date();

//     return this.msBetween(stepStart, stepEnd);
//   } 

//   private msBetween(start: Date, finish: Date) {
//     return start.getTime() - finish.getTime();
//   }

//   private async transferStep() {
//     const {
//       fetchDatasetsFn,
//       transformDatasetsFn,
//       saveDatasetsFn,
//       finishTransferFn,
//       transfer,
//     } = this.props;
//     if (transfer.status === TransferStatus.PAUSING) {
//       this.pauseTransfer();
//       return;
//     }

//     const pagination = this.createPagination();
//     const { datasets, cursor } = await fetchDatasetsFn(pagination);
//     const transformedDatasets = await transformDatasetsFn(datasets);

//     await saveDatasetsFn(transformedDatasets);

//     this.updateTrandsfer(transformedDatasets.length, cursor);
//   }

//   private async pauseTransfer() {
//     const transfer = await this.transfersRepository.update({
//       id: this.props.transfer.id,
//       status: TransferStatus.PAUSED
//     });

//     this.props.transfer = transfer;
    
//     const { unitId } = this.props;

//     this.socketHelper.emit(unitId.toString(), 'transfer', transfer);
//   }

//   private async updateTrandsfer(
//     transfered: number,
//     cursor?: string,
//   ) {
//     const { transfer, limitDatasetsPerRequest } = this.props;

//     const updatedTransfer = await this.transfersRepository.update({
//       id: transfer.id,
//       cursor,
//       offset: transfer.offset + limitDatasetsPerRequest,
//       transfered: transfer.transfered + transfered,
//       retryAttempts: 0
//     });

//     const { unitId } = this.props;

//     this.socketHelper.emit(unitId.toString(), 'transfer', updatedTransfer);
//   }

//   private async completeTrandsfer() {
//     const transfer = await this.transfersRepository.update({
//       id: this.props.transfer.id,
//       status: TransferStatus.COMPLETED,
//       log: 'Transfer succesfully completed'
//     });
    
//     this.props.transfer = transfer;

//     const { unitId } = this.props;

//     this.socketHelper.emit(unitId.toString(), 'transfer', transfer);
//   }

//   private createPagination(): Pagination {
//     const {
//       transfer,
//       paginationType,
//       limitDatasetsPerRequest: limit
//     } = this.props;
    
//     const { offset, cursor } = transfer;
    
//     const cases = {
//       [PaginationType.OFFSET]: () => { return { offset, limit} },
//       [PaginationType.CURSOR]: () => { return { cursor, limit} } 
//     };

//     return cases[paginationType]();
//   }

//     // private finishCondition(
//     //   when: 'beforeStep' | 'afterStep'
//     //   transferParams: TransferParams,
//     //   transfer: Transfer
//     // ) {
//     //   if (total !== undefined && offset >= total) {
//     //     return true;
//     //   }

//     //   if (references !== undefined && offset >= references.length) {
//     //     return true;
//     //   }

//     //   if (datasets.length === 0 && references === undefined) {
//     //     return true;
//     //   }

//     //   return false;
//     // }
// }
