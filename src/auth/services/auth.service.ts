import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from '../dto/signin.dto';
import { SignUpDto } from '../dto/signup.dto';
import { CookieService } from './cookie.service';
import { Response } from 'express';
import { TokenPayload } from '../interfaces/tokenPayload.interface';
import { SignInResponseDto } from '../dto/sign-in-response.dto';
import { SignUpResponseDto } from '../dto/sign-up-response.dto';
import { ConfigService } from '@nestjs/config';
import { TOKEN_CONFIG } from 'src/config/tokens.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cookieService: CookieService,
    private configService: ConfigService,
  ) {}

  private getTokenConfig() {
    return {
      accessToken: this.configService.get<string>('JWT_ACCESS_SECRET') || '',
      refreshToken: this.configService.get<string>('JWT_REFRESH_SECRET') || '',
    };
  }

  async signIn(bodyData: SignInDto, response: Response): Promise<SignInResponseDto> {
    const { email, password } = bodyData;
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Неверный пароль');
      }

      const payload = { sub: user.id, email: user.email };

      const tokens = await this.generateTokens(payload);
      this.cookieService.setTokens(response, tokens.accessToken, tokens.refreshToken);
      return { message: 'Успешная авторизация', user: { id: user.id, email: user.email, name: user.name } };
    }
    throw new UnauthorizedException('Пользователь не найден');
  }

  async signUp(bodyData: SignUpDto): Promise<SignUpResponseDto> {
    return this.usersService.createUser(bodyData);
  }

  async logout(response: Response): Promise<{ message: string }> {
    try {
      this.cookieService.clearTokens(response);
      return { message: 'Успешный выход из системы' };
    } catch (error) {
      throw new UnauthorizedException('Ошибка при выходе из системы');
    }
  }

  async generateTokens(payload: TokenPayload): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.getTokenConfig().accessToken,
          expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.EXPIRES_IN,
        }),
        this.jwtService.signAsync(payload, {
          secret: this.getTokenConfig().refreshToken,
          expiresIn: TOKEN_CONFIG.REFRESH_TOKEN.EXPIRES_IN,
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Ошибка при генерации токенов');
    }
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const payloadData = { sub: payload.sub, email: payload.email };

    try {
      const accessToken = await this.jwtService.signAsync(payloadData, {
        secret: this.getTokenConfig().accessToken,
        expiresIn: TOKEN_CONFIG.ACCESS_TOKEN.EXPIRES_IN,
      });

      return accessToken;
    } catch (error) {
      throw new UnauthorizedException('Ошибка при генерации Access токена');
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new UnauthorizedException('Access токен не предоставлен');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.getTokenConfig().accessToken,
      });
      return payload;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Срок действия access токена истек');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Недействительный access токен');
      }
      throw new UnauthorizedException('Ошибка проверки access токена');
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new UnauthorizedException('Refresh токен не предоставлен');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.getTokenConfig().refreshToken,
      });
      return payload;
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Срок действия refresh токена истек');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Недействительный refresh токен');
      }
      throw new UnauthorizedException('Ошибка проверки refresh токена');
    }
  }
}
