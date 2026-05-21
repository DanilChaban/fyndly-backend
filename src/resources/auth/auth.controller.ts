import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from '@core/guards/google-auth.guard';
import { LanguageCode } from '@core/types/language-code';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { GoogleUser } from '@user/types/google-user';
import { VerifyEmailDto } from '@user/dto/verify-email.dto';
import { ResendVerificationCodeDto } from '@user/dto/resend-verification-code.dto';
import { AuthService } from '@auth/auth.service';
import { LoginDto } from '@auth/dto/login.dto';
import { JwtStrategyService } from '@auth/strategies/jwt-strategy/jwt-strategy.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtStrategyService: JwtStrategyService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.authService.signUp(createUserDto);
  }

  @Post('sign-in')
  async signIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<void> {
    const accessToken = await this.authService.signIn(loginDto);
    this.jwtStrategyService.setAuthCookie(response, accessToken, loginDto.rememberMe);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() request: Request, @Res() response: Response): Promise<void> {
    const googleUser = request['user'] as GoogleUser;
    const accessToken = await this.authService.signInWithGoogle(googleUser);
    const lang = request.query.lang as LanguageCode;
    this.jwtStrategyService.setAuthCookie(response, accessToken, true);
    response.redirect(`${process.env.FRONTEND_URL}/${lang}/home`);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const accessToken = await this.authService.verifyEmail(verifyEmailDto);
    this.jwtStrategyService.setAuthCookie(response, accessToken);
  }

  @Post('resend-verification-code')
  async resendVerificationCode(@Body() resendVerificationCodeDto: ResendVerificationCodeDto): Promise<void> {
    await this.authService.resendVerificationCode(resendVerificationCodeDto);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): void {
    this.jwtStrategyService.clearAuthCookie(response);
  }
}
