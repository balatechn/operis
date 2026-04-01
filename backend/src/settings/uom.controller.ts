import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UomService } from './uom.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Settings - UOM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings/uom')
export class UomController {
  constructor(private readonly uomService: UomService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.uomService.findAll(req.user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() body: any, @Request() req: any) {
    return this.uomService.create(body, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() body: any) {
    return this.uomService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.uomService.deactivate(id);
  }
}
