import { IFieldModel } from '../sub-schemas/field.schema';

export function createRequestedFields(fields: IFieldModel[], idColumn: string) {
  const requestedFields = fields.map(({ source }) => source);
  if (!requestedFields.includes(idColumn)) {
    requestedFields.push(idColumn);
  }
  return requestedFields;
}
