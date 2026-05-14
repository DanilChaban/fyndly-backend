import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { AuthService } from '@auth/auth.service';
import { LoginDto } from '@auth/dto/login.dto';
import { JwtStrategyService } from '@auth/jwt-strategy/jwt-strategy.service';

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
    this.jwtStrategyService.setAuthCookie(response, accessToken);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie('access_token');
  }
}
