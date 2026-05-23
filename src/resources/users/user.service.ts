import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';
import { createFieldError } from '@core/helpers/create-field-error';
import { generateVerificationCode } from '@core/helpers/generate-verification-code';
import { EmailService } from '@email/email.service';
import { UserEntity } from '@user/entities/user.entity';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { GoogleUser } from '@user/types/google-user';
import { VerifyEmailDto } from '@user/dto/verify-email.dto';
import { ResendVerificationCodeDto } from '@user/dto/resend-verification-code.dto';

@Injectable()
export class UserService {
  private VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
  private VERIFICATION_CODE_RESEND_COOLDOWN_MS = 30 * 1000;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly emailService: EmailService,
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
    const verificationCode = generateVerificationCode();

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationCodeExpiresAt: this.getVerificationCodeExpiresAt(),
    });

    const savedUser = await this.userRepository.save(user);

    await this.emailService.sendVerificationCode(savedUser.email, verificationCode);
    return savedUser;
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<UserEntity> {
    const { email, code } = verifyEmailDto;
    const user = await this.findUserByEmail(
      email,
      'emailVerificationCode',
      'emailVerificationCodeExpiresAt',
      'emailVerified',
    );

    if (!user) {
      throw new BadRequestException(ApiErrorCode.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
      return user;
    }

    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      throw new BadRequestException(createFieldError('code', ApiErrorCode.INVALID_VERIFICATION_CODE));
    }

    const expiresAt = user.emailVerificationCodeExpiresAt;

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(ApiErrorCode.VERIFICATION_CODE_EXPIRED);
    }

    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpiresAt = null;
    user.emailVerificationCodeLastSentAt = null;

    return this.userRepository.save(user);
  }

  async resendVerificationCode(resendVerificationCodeDto: ResendVerificationCodeDto): Promise<void> {
    const { email } = resendVerificationCodeDto;
    const user = await this.findUserByEmail(email, 'emailVerified', 'emailVerificationCodeLastSentAt');

    if (!user) {
      throw new BadRequestException(ApiErrorCode.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
      return;
    }

    if (user.emailVerificationCodeLastSentAt) {
      const timePassed = Date.now() - user.emailVerificationCodeLastSentAt.getTime();

      if (timePassed < this.VERIFICATION_CODE_RESEND_COOLDOWN_MS) {
        const retryAfterSeconds = Math.ceil((this.VERIFICATION_CODE_RESEND_COOLDOWN_MS - timePassed) / 1000);

        throw new BadRequestException({
          message: ApiErrorCode.VERIFICATION_CODE_RESEND_TOO_SOON,
          retryAfterSeconds,
        });
      }
    }

    const verificationCode = generateVerificationCode();

    user.emailVerificationCode = verificationCode;
    user.emailVerificationCodeExpiresAt = this.getVerificationCodeExpiresAt();
    user.emailVerificationCodeLastSentAt = new Date();

    await this.userRepository.save(user);
    await this.emailService.sendVerificationCode(user.email, verificationCode);
  }

  async findOrCreateGoogleUser(googleUser: GoogleUser): Promise<UserEntity> {
    const existingUser = await this.findUserByEmail(googleUser.email, 'googleId', 'emailVerified', 'username');

    if (existingUser) {
      if (!existingUser.emailVerified) {
        throw new UnauthorizedException(ApiErrorCode.EMAIL_NOT_VERIFIED);
      }

      if (!existingUser.googleId) {
        existingUser.googleId = googleUser.googleId;

        if (!existingUser.username) {
          existingUser.username = googleUser.username;
        }

        return this.userRepository.save(existingUser);
      }

      return existingUser;
    }

    const user = this.userRepository.create({
      email: googleUser.email,
      googleId: googleUser.googleId,
      username: googleUser.username,
      emailVerified: true,
    });

    return this.userRepository.save(user);
  }

  async findUserByEmail(email: string, ...select: (keyof UserEntity)[]): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email }, select: ['id', 'email', ...select] });
  }

  private getVerificationCodeExpiresAt(): Date {
    return new Date(Date.now() + this.VERIFICATION_CODE_TTL_MS);
  }
}
