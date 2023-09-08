import { ImportField } from '../../imports/interfaces/import-field.interface';

export function createRequestedFields(fields: ImportField[], idColumn: string) {
  const requestedFields = fields.map(({ source }) => source);
  if (!requestedFields.includes(idColumn)) {
    requestedFields.push(idColumn);
  }
  return requestedFields;
}
