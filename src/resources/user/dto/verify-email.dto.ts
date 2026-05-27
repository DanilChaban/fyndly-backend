import { IsEmail, IsString, Length } from 'class-validator';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';

export class VerifyEmailDto {
  @IsEmail({}, { message: ApiErrorCode.VALIDATION_EMAIL })
  email: string;

  @IsString({ message: ApiErrorCode.VALIDATION_INVALID })
  @Length(6, 6, { message: ApiErrorCode.VALIDATION_INVALID })
  code: string;
}
