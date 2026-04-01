import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get('stats') getStats() { return this.service.getStats(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Put(':id/start') start(@Param('id') id: string) { return this.service.startProduction(id); }
  @Put(':id/complete') complete(@Param('id') id: string, @Body() body: any) { return this.service.completeProduction(id, body); }
}
