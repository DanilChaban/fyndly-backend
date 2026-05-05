import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '@user/user.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { LoginDto } from '@auth/dto/login.dto';
import { JwtStrategyService } from '@auth/jwt-strategy/jwt-strategy.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtStrategyService: JwtStrategyService,
    ) {}

    async register(createUserDto: CreateUserDto): Promise<string> {
        const user = await this.userService.createUser(createUserDto);
        return await this.jwtStrategyService.createAccessToken(user.id, user.email);
    }

    async login(loginDto: LoginDto): Promise<string> {
        const user = await this.userService.findUserByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return await this.jwtStrategyService.createAccessToken(user.id, user.email);
    }
}
