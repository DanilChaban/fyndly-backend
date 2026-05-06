import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategyService } from '@auth/jwt-strategy/jwt-strategy.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [JwtStrategyService],
  exports: [JwtModule, JwtStrategyService],
})
export class JwtStrategyModule {}
