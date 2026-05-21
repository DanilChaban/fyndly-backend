import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';
import { UserService } from '@user/user.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { VerifyEmailDto } from '@user/dto/verify-email.dto';
import { ResendVerificationCodeDto } from '@user/dto/resend-verification-code.dto';
import { GoogleUser } from '@user/types/google-user';
import { LoginDto } from '@auth/dto/login.dto';
import { JwtStrategyService } from '@auth/strategies/jwt-strategy/jwt-strategy.service';

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
      throw new UnauthorizedException(ApiErrorCode.EMAIL_NOT_VERIFIED);
    }

    return await this.jwtStrategyService.createAccessToken(user.id, user.email, loginDto.rememberMe);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<string> {
    const user = await this.userService.verifyEmail(verifyEmailDto);
    return await this.jwtStrategyService.createAccessToken(user.id, user.email);
  }

  async resendVerificationCode(resendVerificationCodeDto: ResendVerificationCodeDto): Promise<void> {
    await this.userService.resendVerificationCode(resendVerificationCodeDto);
  }

  async signInWithGoogle(googleUser: GoogleUser): Promise<string> {
    const user = await this.userService.findOrCreateGoogleUser(googleUser);
    return await this.jwtStrategyService.createAccessToken(user.id, user.email);
  }
}
