import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';

export class ResetPasswordDto {
  @IsEmail({}, { message: ApiErrorCode.VALIDATION_EMAIL })
  email: string;

  @IsString({ message: ApiErrorCode.VALIDATION_INVALID })
  @Length(6, 6, { message: ApiErrorCode.VALIDATION_INVALID })
  code: string;

  @IsString({ message: ApiErrorCode.VALIDATION_INVALID })
  @MinLength(8, { message: ApiErrorCode.VALIDATION_MIN_LENGTH })
  password: string;

  @IsString({ message: ApiErrorCode.VALIDATION_INVALID })
  @MinLength(8, { message: ApiErrorCode.VALIDATION_MIN_LENGTH })
  confirmPassword: string;
}
