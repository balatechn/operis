import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalesOrderStatus } from './sales-order.entity';

@ApiTags('Sales & Dispatch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Get('orders') findAllOrders() { return this.service.findAllOrders(); }
  @Get('orders/trend') getTrend() { return this.service.getSalesTrend(); }
  @Get('orders/:id') findOrder(@Param('id') id: string) { return this.service.findOrderById(id); }
  @Post('orders') createOrder(@Body() body: any) { return this.service.createOrder(body); }
  @Put('orders/:id/dispatch') dispatch(@Param('id') id: string) { return this.service.dispatchOrder(id); }
  @Put('orders/:id/status') updateStatus(@Param('id') id: string, @Body() body: { status: SalesOrderStatus }) {
    return this.service.updateOrderStatus(id, body.status);
  }

  @Get('customers') findCustomers() { return this.service.findAllCustomers(); }
  @Post('customers') createCustomer(@Body() body: any) { return this.service.createCustomer(body); }
  @Put('customers/:id') updateCustomer(@Param('id') id: string, @Body() body: any) { return this.service.updateCustomer(id, body); }
}
