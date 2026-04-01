import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview') getOverview(@Request() req: any) { return this.service.getOverview(req.user.companyId); }
  @Get('inventory') getInventory(@Request() req: any) { return this.service.getInventoryHealth(req.user.companyId); }
  @Get('production-efficiency') getEfficiency(@Request() req: any) { return this.service.getProductionEfficiency(req.user.companyId); }
  @Get('sales-trend') getSalesTrend(@Request() req: any) { return this.service.getSalesTrend(req.user.companyId); }
}
