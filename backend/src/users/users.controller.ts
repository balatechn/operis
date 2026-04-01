import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';
import { CompaniesService } from '../companies/companies.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CompaniesService))
    private readonly companiesService: CompaniesService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Request() req: any) {
    const companyId = req.user.role === UserRole.SUPER_ADMIN ? undefined : req.user.companyId;
    return this.usersService.findAll(companyId);
  }

  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: any, @Request() req: any) {
    const companyId = req.user.companyId;
    if (companyId) {
      const company = await this.companiesService.findById(companyId);
      const currentCount = await this.usersService.countByCompany(companyId);
      if (currentCount >= company.maxUsers) {
        throw new BadRequestException(`User limit reached (${company.maxUsers}). Please upgrade your plan.`);
      }
    }
    return this.usersService.create({ ...body, companyId: companyId || body.companyId });
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

