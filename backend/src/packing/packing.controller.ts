import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PackingService } from './packing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Packing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packing')
export class PackingController {
  constructor(private readonly service: PackingService) {}

  @Get() findAll(@Request() req: any) { return this.service.findAll(req.user.companyId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() body: any, @Request() req: any) { return this.service.create(body, req.user.companyId); }
  @Put(':id/complete') complete(@Param('id') id: string) { return this.service.completePackingOrder(id); }
}
