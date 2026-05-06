import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategyService {
  constructor(private readonly jwtService: JwtService) {}

  createAccessToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, email });
  }

  setAuthCookie(response: Response, token: string): void {
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}
