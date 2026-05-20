import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from '@core/guards/google-auth.guard';
import { LanguageCode } from '@core/types/language-code';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { GoogleUser } from '@user/types/google-user';
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
  async signUp(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response: Response): Promise<void> {
    const accessToken = await this.authService.signUp(createUserDto);
    this.jwtStrategyService.setAuthCookie(response, accessToken);
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

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): void {
    this.jwtStrategyService.clearAuthCookie(response);
  }
}
