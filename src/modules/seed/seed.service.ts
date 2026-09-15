import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './seed.data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async onApplicationBootstrap() {
    try {
      const categoryCount = await this.categoryModel.countDocuments();
      const productCount = await this.productModel.countDocuments();
      this.logger.log(`Database status: ${categoryCount} categories, ${productCount} products.`);
    } catch (error) {
      this.logger.error('Failed to run seed check on bootstrap', error);
    }
  }

  async clearAll(): Promise<{ message: string; deletedCategories: number; deletedProducts: number }> {
    const catRes = await this.categoryModel.deleteMany({});
    const prodRes = await this.productModel.deleteMany({});
    this.logger.log(`Cleared database: ${catRes.deletedCount} categories, ${prodRes.deletedCount} products deleted.`);
    return {
      message: 'All demo products and categories cleared',
      deletedCategories: catRes.deletedCount,
      deletedProducts: prodRes.deletedCount,
    };
  }


  async seedAll(force: boolean = false): Promise<{ message: string; categoriesCount: number; productsCount: number }> {
    if (force) {
      await this.categoryModel.deleteMany({});
      await this.productModel.deleteMany({});
      this.logger.log('Cleared existing categories and products collections.');
    }

    // Upsert Categories
    let catUpserted = 0;
    for (const cat of INITIAL_CATEGORIES) {
      await this.categoryModel.findOneAndUpdate(
        { id: cat.id },
        { $set: cat },
        { upsert: true, new: true },
      );
      catUpserted++;
    }

    // Upsert Products
    let prodUpserted = 0;
    for (const prod of INITIAL_PRODUCTS) {
      await this.productModel.findOneAndUpdate(
        { id: prod.id },
        { $set: prod },
        { upsert: true, new: true },
      );
      prodUpserted++;
    }

    this.logger.log(`Successfully seeded ${catUpserted} categories and ${prodUpserted} products.`);
    return {
      message: 'Seed completed successfully',
      categoriesCount: catUpserted,
      productsCount: prodUpserted,
    };
  }
}
