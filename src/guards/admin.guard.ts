import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];
    const configuredKey =
      this.configService.get<string>('ADMIN_SECRET_KEY') || 'admin786';

    if (!adminKey || adminKey !== configuredKey) {
      throw new UnauthorizedException(
        'Admin access denied. Invalid or missing admin key.',
      );
    }

    return true;
  }
}
