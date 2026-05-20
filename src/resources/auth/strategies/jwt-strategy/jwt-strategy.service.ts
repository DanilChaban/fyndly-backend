import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN } from '@core/constants/constants';
import { ONE_DAY_MS, THIRTY_DAYS_MS } from '@auth/constants/constants';

@Injectable()
export class JwtStrategyService {
  constructor(private readonly jwtService: JwtService) {}

  createAccessToken(userId: string, email: string, rememberMe = false): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, email }, { expiresIn: rememberMe ? '30d' : '1d' });
  }

  setAuthCookie(response: Response, token: string, rememberMe = false): void {
    response.cookie(ACCESS_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? THIRTY_DAYS_MS : ONE_DAY_MS,
      path: '/',
    });
  }

  clearAuthCookie(response: Response): void {
    response.clearCookie(ACCESS_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}
