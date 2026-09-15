import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<Category | null> {
    return this.categoryModel.findOne({ id }).exec();
  }

  async create(category: Partial<Category>): Promise<Category> {
    const created = new this.categoryModel(category);
    return created.save();
  }

  async delete(id: string): Promise<Category | null> {
    return this.categoryModel.findOneAndDelete({ id }).exec();
  }
}

