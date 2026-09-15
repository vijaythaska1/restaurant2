import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    return `PH-${timestamp}-${random}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      status: 'pending',
    });
    return createdOrder.save();
  }

  async findAll(status?: string): Promise<Order[]> {
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    return this.orderModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
      })
      .exec();
    if (!order) {
      throw new NotFoundException(`Order '${id}' not found`);
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderModel
      .findOneAndUpdate(
        {
          $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
        },
        { $set: { status } },
        { new: true },
      )
      .exec();
    if (!order) {
      throw new NotFoundException(`Order '${id}' not found`);
    }
    return order;
  }
}
