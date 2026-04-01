import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder, SalesOrderStatus, Customer } from './sales-order.entity';
import { FinishedGoodsService } from '../finished-goods/finished-goods.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SalesOrder) private readonly soRepo: Repository<SalesOrder>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    private readonly fgService: FinishedGoodsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async findAllOrders(): Promise<SalesOrder[]> {
    return this.soRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOrderById(id: string): Promise<SalesOrder> {
    const order = await this.soRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Sales order not found');
    return order;
  }

  async createOrder(data: Partial<SalesOrder>): Promise<SalesOrder> {
    // Check stock availability
    for (const item of data.items || []) {
      const fg = await this.fgService.findById(item.finishedGoodId);
      if (Number(fg.currentStock) < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${item.name}: Available ${fg.currentStock}, Required ${item.quantity}`);
      }
    }
    const count = await this.soRepo.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
    const order = this.soRepo.create({
      ...data,
      orderNumber: `SO-${String(count + 1).padStart(5, '0')}`,
      invoiceNumber,
    });
    const saved = await this.soRepo.save(order);
    this.realtime.emitToAll('sales:created', saved);
    return saved;
  }

  async dispatchOrder(id: string): Promise<SalesOrder> {
    const order = await this.findOrderById(id);
    // Deduct stock
    for (const item of order.items) {
      await this.fgService.deductStock(item.finishedGoodId, item.quantity);
    }
    order.status = SalesOrderStatus.DISPATCHED;
    order.dispatchDate = new Date();
    const saved = await this.soRepo.save(order);
    this.realtime.emitToAll('sales:dispatched', saved);
    return saved;
  }

  async updateOrderStatus(id: string, status: SalesOrderStatus): Promise<SalesOrder> {
    const order = await this.findOrderById(id);
    order.status = status;
    return this.soRepo.save(order);
  }

  async getSalesTrend() {
    const orders = await this.soRepo.find({ order: { createdAt: 'DESC' } });
    return orders.reduce((acc: any[], order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      const existing = acc.find((a) => a.date === date);
      if (existing) {
        existing.total += Number(order.totalAmount);
        existing.count++;
      } else {
        acc.push({ date, total: Number(order.totalAmount), count: 1 });
      }
      return acc;
    }, []);
  }

  async findAllCustomers(): Promise<Customer[]> {
    return this.customerRepo.find({ order: { name: 'ASC' } });
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepo.create(data);
    return this.customerRepo.save(customer);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    await this.customerRepo.update(id, data);
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
