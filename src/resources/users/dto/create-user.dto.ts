import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';

export class CreateUserDto {
  @IsString({ message: ApiErrorCode.VALIDATION_INVALID })
  username: string;

  @IsEmail({}, { message: ApiErrorCode.VALIDATION_EMAIL })
  email: string;

  @IsString({ message: ApiErrorCode.VALIDATION_INVALID })
  @MinLength(8, { message: ApiErrorCode.VALIDATION_MIN_LENGTH })
  password: string;

  @IsString({ message: ApiErrorCode.VALIDATION_INVALID })
  @MinLength(8, { message: ApiErrorCode.VALIDATION_MIN_LENGTH })
  confirmPassword: string;
}
