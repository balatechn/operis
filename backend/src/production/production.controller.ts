import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @Get() findAll(@Request() req: any) { return this.service.findAll(req.user.companyId); }
  @Get('stats') getStats(@Request() req: any) { return this.service.getStats(req.user.companyId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() body: any, @Request() req: any) { return this.service.create(body, req.user.companyId); }
  @Put(':id/start') start(@Param('id') id: string) { return this.service.startProduction(id); }
  @Put(':id/complete') complete(@Param('id') id: string, @Body() body: any) { return this.service.completeProduction(id, body); }
}
