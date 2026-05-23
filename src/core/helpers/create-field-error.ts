import { ApiErrorCode } from '@core/enums/api-error-code.enum';
import { ErrorFieldsMessage } from '@core/types/error-field-message';

export function createFieldError(field: string, code: ApiErrorCode): ErrorFieldsMessage {
  return {
    code,
    fields: [
      {
        code,
        field,
      },
    ],
  };
}
