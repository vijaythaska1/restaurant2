import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { AppService } from './app.service';

export class VerifyAdminDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService?: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('admin/verify')
  @HttpCode(HttpStatus.OK)
  verifyAdmin(@Body() body: VerifyAdminDto) {
    const configuredKey =
      this.configService?.get<string>('ADMIN_SECRET_KEY') ||
      process.env.ADMIN_SECRET_KEY ||
      'admin786';

    if (body?.key && body.key.trim() === configuredKey) {
      return {
        success: true,
        message: 'Admin access granted! Welcome back.',
      };
    }

    throw new UnauthorizedException({
      success: false,
      message: 'Incorrect Secret Key! Access Denied.',
    });
  }
}
