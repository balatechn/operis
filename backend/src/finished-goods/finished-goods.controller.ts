import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinishedGoodsService } from './finished-goods.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Finished Goods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finished-goods')
export class FinishedGoodsController {
  constructor(private readonly service: FinishedGoodsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get('dashboard') getStats() { return this.service.getDashboardStats(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Post(':id/stock') addStock(@Param('id') id: string, @Body() body: any) { return this.service.addStock(id, body); }
  @Put(':id/quality') updateQuality(@Param('id') id: string, @Body() body: any) { return this.service.updateQualityStatus(id, body.status); }
}
