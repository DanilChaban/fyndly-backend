import { ValidationError } from '@nestjs/common';
import { ErrorFieldMessage } from '@core/types/error-field-message';

export function formatValidationErrors(errors: ValidationError[]): ErrorFieldMessage[] {
  return errors.flatMap((error) => {
    const codes = Object.values(error.constraints || {});

    return codes.map((code) => ({
      field: error.property,
      code,
    }));
  });
}
