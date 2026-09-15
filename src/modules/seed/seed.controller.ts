import { Controller, Post, Delete, Query, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('seed')
@UseGuards(AdminGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async runSeed(@Query('force') force?: string) {
    const isForce = force === 'true' || force === '1';
    return this.seedService.seedAll(isForce);
  }

  @Delete('clear')
  async clearAll() {
    return this.seedService.clearAll();
  }
}
