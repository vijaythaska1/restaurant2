import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  size?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 1 })
  qty: number;

  @Prop({ required: true })
  subtotal: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type OrderType = 'Dine-in' | 'Takeaway' | 'Home Delivery';

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderNumber: string;

  @Prop({ required: true, index: true })
  customerName: string;

  @Prop({ required: true, index: true })
  customerPhone: string;

  @Prop({ required: true, enum: ['Dine-in', 'Takeaway', 'Home Delivery'] })
  orderType: OrderType;

  @Prop({ required: false })
  tableNumber?: string;

  @Prop({ required: false })
  deliveryAddress?: string;

  @Prop({ required: false, default: '' })
  notes?: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  })
  status: OrderStatus;

  @Prop({ required: false })
  whatsappMessage?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
