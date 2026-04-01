import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Settings - Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.itemsService.findAll(req.user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() body: any, @Request() req: any) {
    return this.itemsService.create(body, req.user.companyId);
  }

  @Post('bulk-upload')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are supported');
    }
    const rows = parseCsv(file.buffer.toString('utf-8'));
    return this.itemsService.bulkCreate(rows, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() body: any) {
    return this.itemsService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.itemsService.deactivate(id);
  }
}

function parseCsv(csv: string): any[] {
  const lines = csv.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    // Map CSV column names to entity fields
    return {
      code: obj.code || obj.item_code,
      name: obj.name || obj.item_name,
      categoryId: obj.category_id || obj.categoryid,
      uomId: obj.uom_id || obj.uomid,
      hsnCode: obj.hsn_code || obj.hsn,
      gstRate: parseFloat(obj.gst_rate || obj.gst || '0') || 0,
      sellingPrice: parseFloat(obj.selling_price || obj.price || '0') || 0,
      description: obj.description || '',
    };
  });
}
