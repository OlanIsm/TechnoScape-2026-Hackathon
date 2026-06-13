import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JWTPayload }>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan');
    }
    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'VOLUMEMATE_SUPER_SECRET_KEY_2026',
      })) as unknown as JWTPayload;
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token autentikasi tidak valid');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      return token;
    }
    if (request.query && typeof request.query.token === 'string') {
      return request.query.token;
    }
    return undefined;
  }
}
