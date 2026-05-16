import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@user/user.module';
import { AuthController } from '@auth/auth.controller';
import { JwtStrategyModule } from '@auth/strategies/jwt-strategy/jwt-strategy.module';
import { AuthService } from '@auth/auth.service';
import { GoogleStrategyModule } from '@auth/strategies/google-strategy/google-strategy.module';

@Module({
  imports: [forwardRef(() => UserModule), JwtStrategyModule, PassportModule, GoogleStrategyModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
