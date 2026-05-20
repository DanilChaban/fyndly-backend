import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategyModule } from '@auth/strategies/jwt-strategy/jwt-strategy.module';
import { EmailModule } from '@email/email.module';
import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';
import { UserEntity } from '@user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), forwardRef(() => JwtStrategyModule), EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
