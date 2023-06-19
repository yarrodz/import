import { IField } from '../sub-schemas/field.schema';
import { parseValue } from './parse-value';

export function transformRecords(fields: IField[], sourceDataset: object) {
  const records = [];
  fields.forEach(({ feature, source }) => {
    const value = sourceDataset[source];

    const parsedValue = parseValue(feature, value);

    records.push({
      value: parsedValue,
      feature: feature._id
    });
  });
  return records;
}
