import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AdminGuard } from '../../guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService, AdminGuard],
  exports: [SeedService],
})
export class SeedModule {}
