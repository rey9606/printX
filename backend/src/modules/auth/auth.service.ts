import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from '../users/dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
      role: dto.role,
      isActive: true,
      isVerified: false,
    });

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refresh(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '15m' as const,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d' as const,
      }),
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };
  }
}