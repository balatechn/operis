import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Recipes / BOM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipeController {
  constructor(private readonly service: RecipeService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }
  @Get(':id/availability') checkAvailability(@Param('id') id: string, @Query('batches') batches: number) {
    return this.service.checkRMAvailability(id, batches || 1);
  }
  @Get(':id/cost') calculateCost(@Param('id') id: string) { return this.service.calculateCost(id); }
}
