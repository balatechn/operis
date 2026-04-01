import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RawMaterialsService } from './raw-materials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Raw Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('raw-materials')
export class RawMaterialsController {
  constructor(private readonly service: RawMaterialsService) {}

  @Get() findAll(@Request() req: any) { return this.service.findAll(req.user.companyId); }
  @Get('dashboard') getDashboard(@Request() req: any) { return this.service.getDashboardStats(req.user.companyId); }
  @Get('low-stock') getLowStock(@Request() req: any) { return this.service.getLowStockItems(req.user.companyId); }
  @Get('expiry-alerts') getExpiry(@Query('days') days: number) { return this.service.getExpiryAlerts(days || 30); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() body: any, @Request() req: any) { return this.service.create(body, req.user.companyId); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Post(':id/batch') addBatch(@Param('id') id: string, @Body() body: any) { return this.service.addBatch(id, body); }
}
