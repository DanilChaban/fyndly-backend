import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';
import { createFieldError } from '@core/helpers/create-field-error';
import { UserEntity } from '@user/entities/user.entity';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { GoogleUser } from '@user/types/google-user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { password, confirmPassword, email, username } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException(createFieldError('confirmPassword', ApiErrorCode.PASSWORD_DO_NOT_MATCH));
    }

    const emailExists = await this.userRepository.findOne({
      where: { email },
    });

    if (emailExists) {
      throw new ConflictException(createFieldError('email', ApiErrorCode.EMAIL_ALREADY_EXISTS));
    }

    const usernameExists = await this.userRepository.findOne({
      where: { username },
    });

    if (usernameExists) {
      throw new ConflictException(createFieldError('username', ApiErrorCode.USERNAME_ALREADY_EXISTS));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findOrCreateGoogleUser(googleUser: GoogleUser): Promise<UserEntity> {
    const existingUser = await this.findUserByEmail(googleUser.email);

    if (existingUser) {
      return existingUser;
    }

    const user = this.userRepository.create({
      email: googleUser.email,
      googleId: googleUser.googleId,
      username: googleUser.username,
    });

    return this.userRepository.save(user);
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email }, select: ['email'] });
  }
}
