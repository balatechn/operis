import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RawMaterialsService } from './raw-materials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Raw Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('raw-materials')
export class RawMaterialsController {
  constructor(private readonly service: RawMaterialsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get('dashboard') getDashboard() { return this.service.getDashboardStats(); }
  @Get('low-stock') getLowStock() { return this.service.getLowStockItems(); }
  @Get('expiry-alerts') getExpiry(@Query('days') days: number) { return this.service.getExpiryAlerts(days || 30); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Post(':id/batch') addBatch(@Param('id') id: string, @Body() body: any) { return this.service.addBatch(id, body); }
}
