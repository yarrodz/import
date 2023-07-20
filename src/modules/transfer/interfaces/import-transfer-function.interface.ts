import { IImportProcess } from '../../import-processes/import-process.schema';
import { IImportDocument } from '../../imports/import.schema';

export default interface IImportTransferFunction {
  (impt: IImportDocument, process: IImportProcess): Promise<void>;
}
