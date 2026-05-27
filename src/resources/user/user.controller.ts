import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@core/decorators/user.decorator';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { UserEntity } from '@user/entities/user.entity';
import { UserService } from '@user/user.service';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async me(@User() user: UserEntity): Promise<UserEntity> {
    return await this.userService.me(user.id);
  }
}
