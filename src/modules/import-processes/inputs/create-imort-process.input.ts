import { IImportProcess } from '../import-process.schema';

export class CreateImportProcessInput implements Partial<IImportProcess> {
  unit: string;
  import: string;
}
