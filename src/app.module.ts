import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { typeormConfig } from '@app/database/database-init';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(typeormConfig),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
