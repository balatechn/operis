import {
  Controller, Get, Post, Patch, Body, Param,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { SubscriptionPlan } from './company.entity';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /** Public endpoint — company self-registration */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body()
    body: {
      companyName: string;
      industry?: string;
      plan?: SubscriptionPlan;
      adminName: string;
      adminEmail: string;
      adminPassword: string;
      phone?: string;
      gstin?: string;
      address?: string;
    },
  ) {
    return this.companiesService.register(body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('pending-count')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  getPendingCount() {
    return this.companiesService.getPendingCount();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.companiesService.update(id, body);
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  approve(@Param('id') id: string) {
    return this.companiesService.approve(id);
  }

  @Patch(':id/hold')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  hold(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.companiesService.hold(id, body.reason);
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.companiesService.reject(id, body.reason);
  }

  @Patch(':id/suspend')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  suspend(@Param('id') id: string) {
    return this.companiesService.suspend(id);
  }
}
