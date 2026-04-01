import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryType } from './category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Settings - Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Request() req: any, @Query('type') type?: CategoryType) {
    return this.categoriesService.findAll(req.user.companyId, type);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() body: any, @Request() req: any) {
    return this.categoriesService.create(body, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() body: any) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.categoriesService.deactivate(id);
  }
}
