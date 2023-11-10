import { ImportField } from "../../transfers/interfaces/import-field.interface";

export class RequestedFieldsHelper {
  static create(fields: ImportField[], idKey: string) {
    const requestedFields = fields.map(({ source }) => source);
  
    if (requestedFields.includes(idKey) === false) {
      requestedFields.push(idKey);
    }

    return requestedFields;
  }
}
