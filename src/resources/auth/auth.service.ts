import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';
import { UserService } from '@user/user.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { VerifyEmailDto } from '@user/dto/verify-email.dto';
import { ResendVerificationCodeDto } from '@user/dto/resend-verification-code.dto';
import { GoogleUser } from '@user/types/google-user';
import { JwtStrategyService } from '@auth/strategies/jwt-strategy/jwt-strategy.service';
import { ForgotPasswordDto } from '@user/dto/forgot-password.dto';
import { ResetPasswordDto } from '@user/dto/reset-password-dto';
import { LoginDto } from '@auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtStrategyService: JwtStrategyService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<void> {
    await this.userService.createUser(createUserDto);
  }

  async signIn(loginDto: LoginDto): Promise<string> {
    const user = await this.userService.findUserByEmail(loginDto.email, 'password', 'emailVerified');

    if (!user || !user.password) {
      throw new UnauthorizedException(ApiErrorCode.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ApiErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(ApiErrorCode.EMAIL_NOT_VERIFIED);
    }

    return await this.jwtStrategyService.createAccessToken(user.id, user.email, loginDto.rememberMe);
  }

  async signInWithGoogle(googleUser: GoogleUser): Promise<string> {
    const user = await this.userService.findOrCreateGoogleUser(googleUser);
    return await this.jwtStrategyService.createAccessToken(user.id, user.email);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<string> {
    const user = await this.userService.verifyEmail(verifyEmailDto);
    return await this.jwtStrategyService.createAccessToken(user.id, user.email);
  }

  async resendVerificationCode(resendVerificationCodeDto: ResendVerificationCodeDto): Promise<void> {
    await this.userService.resendVerificationCode(resendVerificationCodeDto);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  async resendResetPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.userService.resetPassword(resetPasswordDto);
  }
}
