import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@core/decorators/user.decorator';
import { AuthGuard } from '@core/guards/auth.guard';
import { UserEntity } from '@user/entities/user.entity';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  @Get()
  me(@User() user: UserEntity): UserEntity {
    return user;
  }
}
