import Synchronization from '../../synchronizations/interfaces/synchronization.interface';
import Transfer from './transfer.interface';

export default interface TransferFunction {
  (synchronization: Synchronization, transfer: Transfer): Promise<void>;
}
