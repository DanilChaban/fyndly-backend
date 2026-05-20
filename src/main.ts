import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@app/app.module';
import { ApiErrorCode } from '@core/enums/api-error-code.enum';
import { formatValidationErrors } from '@core/helpers/format-validation-errors';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          code: ApiErrorCode.VALIDATION_ERROR,
          fields: formatValidationErrors(errors),
        });
      },
    }),
  );

  await app.listen(Number(process.env.DATABASE_PORT));
}
void bootstrap();
