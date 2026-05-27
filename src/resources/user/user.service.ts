import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';
import { createFieldError } from '@core/helpers/create-field-error';
import { generateVerificationCode } from '@core/helpers/generate-verification-code';
import { getRetryAfterSeconds } from '@core/helpers/get-retry-after-seconds';
import { EmailService } from '@email/email.service';
import { UserEntity } from '@user/entities/user.entity';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { VerifyEmailDto } from '@user/dto/verify-email.dto';
import { ResendVerificationCodeDto } from '@user/dto/resend-verification-code.dto';
import { GoogleUser } from '@user/types/google-user';
import { ForgotPasswordDto } from '@user/dto/forgot-password.dto';
import { ResetPasswordDto } from '@user/dto/reset-password-dto';

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

  async me(userId: string): Promise<UserEntity> {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
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

    const retryAfterSeconds = getRetryAfterSeconds(
      user.emailVerificationCodeLastSentAt,
      this.VERIFICATION_CODE_RESEND_COOLDOWN_MS,
    );

    if (retryAfterSeconds) {
      throw new BadRequestException({
        message: ApiErrorCode.VERIFICATION_CODE_RESEND_TOO_SOON,
        retryAfterSeconds,
      });
    }

    const verificationCode = generateVerificationCode();

    user.emailVerificationCode = verificationCode;
    user.emailVerificationCodeExpiresAt = this.getVerificationCodeExpiresAt();
    user.emailVerificationCodeLastSentAt = new Date();

    await this.userRepository.save(user);
    await this.emailService.sendVerificationCode(user.email, verificationCode);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    const user = await this.findUserByEmail(email, 'resetPasswordCodeLastSentAt');

    if (!user) {
      throw new BadRequestException(createFieldError('email', ApiErrorCode.USER_NOT_FOUND));
    }

    const retryAfterSeconds = getRetryAfterSeconds(
      user.resetPasswordCodeLastSentAt,
      this.VERIFICATION_CODE_RESEND_COOLDOWN_MS,
    );

    if (retryAfterSeconds) {
      throw new BadRequestException({
        message: ApiErrorCode.RESET_PASSWORD_CODE_RESEND_TOO_SOON,
        retryAfterSeconds,
      });
    }

    const resetPasswordCode = generateVerificationCode();

    user.resetPasswordCode = resetPasswordCode;
    user.resetPasswordCodeExpiresAt = this.getVerificationCodeExpiresAt();
    user.resetPasswordCodeLastSentAt = new Date();

    await this.userRepository.save(user);
    await this.emailService.sendResetPasswordCode(user.email, resetPasswordCode);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, code, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException(createFieldError('confirmPassword', ApiErrorCode.PASSWORD_DO_NOT_MATCH));
    }

    const user = await this.findUserByEmail(email, 'resetPasswordCode', 'resetPasswordCodeExpiresAt', 'password');

    if (!user) {
      throw new BadRequestException(ApiErrorCode.USER_NOT_FOUND);
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      throw new BadRequestException(createFieldError('code', ApiErrorCode.INVALID_RESET_PASSWORD_CODE));
    }

    const expiresAt = user.resetPasswordCodeExpiresAt;

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(createFieldError('code', ApiErrorCode.RESET_PASSWORD_CODE_EXPIRED));
    }

    if (user.password) {
      const isSamePassword = await bcrypt.compare(password, user.password);

      if (isSamePassword) {
        throw new BadRequestException(createFieldError('password', ApiErrorCode.NEW_PASSWORD_MUST_BE_DIFFERENT));
      }
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiresAt = null;
    user.resetPasswordCodeLastSentAt = null;

    await this.userRepository.save(user);
  }

  async findUserByEmail(email: string, ...select: (keyof UserEntity)[]): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email }, select: ['id', 'email', ...select] });
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  private getVerificationCodeExpiresAt(): Date {
    return new Date(Date.now() + this.VERIFICATION_CODE_TTL_MS);
  }
}
