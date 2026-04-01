import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Purchase')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('orders') findAllPOs() { return this.purchaseService.findAllPOs(); }
  @Get('orders/:id') findPO(@Param('id') id: string) { return this.purchaseService.findPOById(id); }
  @Post('orders') createPO(@Body() body: any) { return this.purchaseService.createPO(body); }
  @Put('orders/:id') updatePO(@Param('id') id: string, @Body() body: any) { return this.purchaseService.updatePO(id, body); }

  @Get('grns') findAllGRNs() { return this.purchaseService.findAllGRNs(); }
  @Post('grns') createGRN(@Body() body: any) { return this.purchaseService.createGRN(body); }
  @Put('grns/:id/approve') approveGRN(@Param('id') id: string) { return this.purchaseService.approveGRN(id); }

  @Get('vendors') findAllVendors() { return this.purchaseService.findAllVendors(); }
  @Get('vendors/:id') findVendor(@Param('id') id: string) { return this.purchaseService.findVendorById(id); }
  @Post('vendors') createVendor(@Body() body: any) { return this.purchaseService.createVendor(body); }
  @Put('vendors/:id') updateVendor(@Param('id') id: string, @Body() body: any) { return this.purchaseService.updateVendor(id, body); }
}
