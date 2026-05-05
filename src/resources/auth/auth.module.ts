import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from '@auth/auth.service';
import { UserModule } from '@user/user.module';
import { AuthController } from '@auth/auth.controller';
import { JwtStrategyModule } from '@auth/jwt-strategy/jwt-strategy.module';

@Module({
    imports: [forwardRef(() => UserModule), JwtStrategyModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
