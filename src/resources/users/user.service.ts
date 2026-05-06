import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '@user/entities/user.entity';
import { CreateUserDto } from '@user/dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    if (!createUserDto) {
      throw new BadRequestException('Request body is required');
    }

    const { password, confirmPassword, ...userData } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const userExist = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (userExist) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email }, select: ['email', 'password'] });
  }
}
