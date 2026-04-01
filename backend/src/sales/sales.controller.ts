import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
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

  @Get('orders') findAllOrders(@Request() req: any) { return this.service.findAllOrders(req.user.companyId); }
  @Get('orders/trend') getTrend(@Request() req: any) { return this.service.getSalesTrend(req.user.companyId); }
  @Get('orders/:id') findOrder(@Param('id') id: string) { return this.service.findOrderById(id); }
  @Post('orders') createOrder(@Body() body: any, @Request() req: any) { return this.service.createOrder(body, req.user.companyId); }
  @Put('orders/:id/dispatch') dispatch(@Param('id') id: string) { return this.service.dispatchOrder(id); }
  @Put('orders/:id/status') updateStatus(@Param('id') id: string, @Body() body: { status: SalesOrderStatus }) {
    return this.service.updateOrderStatus(id, body.status);
  }

  @Get('customers') findCustomers(@Request() req: any) { return this.service.findAllCustomers(req.user.companyId); }
  @Post('customers') createCustomer(@Body() body: any, @Request() req: any) { return this.service.createCustomer(body, req.user.companyId); }
  @Put('customers/:id') updateCustomer(@Param('id') id: string, @Body() body: any) { return this.service.updateCustomer(id, body); }
}
