import { IsEmail } from 'class-validator';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';

export class ForgotPasswordDto {
  @IsEmail({}, { message: ApiErrorCode.VALIDATION_EMAIL })
  email: string;
}
