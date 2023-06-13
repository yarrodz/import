import { ValidationError } from 'class-validator';

interface IFormattedValidationError {
  property: string;
  errors: string[];
}

export function formatValidationErrors(
  errors: ValidationError[]
): IFormattedValidationError[] {
  const result: IFormattedValidationError[] = [];
  for (const error of errors) {
    result.push({
      property: error.property,
      errors: flattenErrors(error)
    });
  }
  return result;
}

function flattenErrors(error: ValidationError): string[] {
  if (error.children.length) {
    return error.children.flatMap(flattenErrors);
  } else {
    return Object.values(error.constraints);
  }
}
