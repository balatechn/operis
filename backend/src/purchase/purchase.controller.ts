import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Purchase')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('orders') findAllPOs(@Request() req: any) { return this.purchaseService.findAllPOs(req.user.companyId); }
  @Get('orders/:id') findPO(@Param('id') id: string) { return this.purchaseService.findPOById(id); }
  @Post('orders') createPO(@Body() body: any, @Request() req: any) { return this.purchaseService.createPO(body, req.user.companyId); }
  @Put('orders/:id') updatePO(@Param('id') id: string, @Body() body: any) { return this.purchaseService.updatePO(id, body); }

  @Get('grns') findAllGRNs(@Request() req: any) { return this.purchaseService.findAllGRNs(req.user.companyId); }
  @Post('grns') createGRN(@Body() body: any, @Request() req: any) { return this.purchaseService.createGRN(body, req.user.companyId); }
  @Put('grns/:id/approve') approveGRN(@Param('id') id: string) { return this.purchaseService.approveGRN(id); }

  @Get('vendors') findAllVendors(@Request() req: any) { return this.purchaseService.findAllVendors(req.user.companyId); }
  @Get('vendors/:id') findVendor(@Param('id') id: string) { return this.purchaseService.findVendorById(id); }
  @Post('vendors') createVendor(@Body() body: any, @Request() req: any) { return this.purchaseService.createVendor(body, req.user.companyId); }
  @Put('vendors/:id') updateVendor(@Param('id') id: string, @Body() body: any) { return this.purchaseService.updateVendor(id, body); }
}
