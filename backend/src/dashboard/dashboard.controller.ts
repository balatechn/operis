import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview') getOverview() { return this.service.getOverview(); }
  @Get('inventory') getInventory() { return this.service.getInventoryHealth(); }
  @Get('production-efficiency') getEfficiency() { return this.service.getProductionEfficiency(); }
  @Get('sales-trend') getSalesTrend() { return this.service.getSalesTrend(); }
}
