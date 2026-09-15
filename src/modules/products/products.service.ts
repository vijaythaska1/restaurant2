import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(cat?: string, search?: string): Promise<Product[]> {
    const filter: any = { isAvailable: true };

    if (cat && cat !== 'all') {
      filter.cat = cat;
    }

    if (search && search.trim().length > 0) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { name: regex },
        { desc: regex },
        { section: regex },
      ];
    }

    return this.productModel.find(filter).sort({ order: 1, createdAt: 1 }).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findOne({ id }).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const created = new this.productModel(createProductDto);
      return await created.save();
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          `Product with ID '${createProductDto.id}' already exists`,
        );
      }
      throw err;
    }
  }

  async update(id: string, updateDto: Partial<Product>): Promise<Product> {
    const updated = await this.productModel
      .findOneAndUpdate({ id }, { $set: updateDto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const res = await this.productModel.deleteOne({ id }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return { success: true };
  }
}
