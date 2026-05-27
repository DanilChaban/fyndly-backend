import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@core/decorators/user.decorator';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { UserEntity } from '@user/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  @Get('me')
  me(@User() user: UserEntity): UserEntity {
    return user;
  }
}
