import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('purchase')
  purchaseReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.purchaseReport(req.user.companyId, { startDate, endDate, vendorId, status });
  }

  @Get('grn')
  grnReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('materialId') materialId?: string,
  ) {
    return this.reportsService.grnReport(req.user.companyId, { startDate, endDate, materialId });
  }

  @Get('consumption')
  consumptionReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('materialId') materialId?: string,
  ) {
    return this.reportsService.consumptionReport(req.user.companyId, { startDate, endDate, materialId });
  }

  @Get('stock-ledger')
  stockLedgerReport(
    @Request() req: any,
    @Query('materialId') materialId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.stockLedgerReport(req.user.companyId, { materialId, startDate, endDate });
  }

  @Get('production')
  productionReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('recipeId') recipeId?: string,
  ) {
    return this.reportsService.productionReport(req.user.companyId, { startDate, endDate, recipeId });
  }

  @Get('finished-goods')
  finishedGoodsReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sku') sku?: string,
  ) {
    return this.reportsService.finishedGoodsReport(req.user.companyId, { startDate, endDate, sku });
  }

  @Get('sales')
  salesReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.reportsService.salesReport(req.user.companyId, { startDate, endDate, customerId });
  }

  @Get('packing')
  packingReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.packingReport(req.user.companyId, { startDate, endDate });
  }
}
