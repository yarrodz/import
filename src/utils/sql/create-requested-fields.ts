import { IField } from '../../modules/imports/sub-schemas/field.schema';

export function createRequestedFields(fields: IField[], idColumn: string) {
  const requestedFields = fields.map(({ source }) => source);
  if (!requestedFields.includes(idColumn)) {
    requestedFields.push(idColumn);
  }
  return requestedFields;
}
