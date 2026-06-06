import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@core/decorators/user.decorator';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { UserEntity } from '@user/entities/user.entity';
import { UserService } from '@user/user.service';
import { UpdateUserDto } from '@user/dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async user(@User() user: UserEntity): Promise<UserEntity> {
    return await this.userService.user(user.id);
  }

  @Patch()
  async updateUser(@User() user: UserEntity, @Body() updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return await this.userService.updateUser(user.id, updateUserDto);
  }
}
