import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  cat: string;

  @Prop({ required: true, index: true })
  section: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ default: '' })
  desc: string;

  @Prop({ required: false, type: Number })
  price?: number;

  @Prop({
    required: false,
    type: Map,
    of: Number,
  })
  sizes?: Record<string, number>;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
