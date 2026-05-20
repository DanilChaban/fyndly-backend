import { Module } from '@nestjs/common';
import { GoogleStrategy } from '@auth/strategies/google-strategy/google-strategy.service';

@Module({
  imports: [],
  providers: [GoogleStrategy],
  exports: [GoogleStrategy],
})
export class GoogleStrategyModule {}
