import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemMaster } from './item-master.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemMaster)
    private readonly itemRepo: Repository<ItemMaster>,
  ) {}

  async findAll(companyId?: string): Promise<ItemMaster[]> {
    const where: any = { isActive: true };
    if (companyId) where.companyId = companyId;
    return this.itemRepo.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<ItemMaster> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async create(data: Partial<ItemMaster>, companyId?: string): Promise<ItemMaster> {
    const existing = await this.itemRepo.findOne({
      where: { code: data.code, companyId: companyId || null },
    });
    if (existing) throw new ConflictException(`Item code "${data.code}" already exists`);
    const item = this.itemRepo.create({ ...data, companyId });
    return this.itemRepo.save(item);
  }

  async update(id: string, data: Partial<ItemMaster>): Promise<ItemMaster> {
    await this.itemRepo.update(id, data);
    return this.findById(id);
  }

  async deactivate(id: string): Promise<ItemMaster> {
    await this.itemRepo.update(id, { isActive: false });
    return this.findById(id);
  }

  /** Bulk upload from CSV parsed rows */
  async bulkCreate(
    rows: Array<Partial<ItemMaster>>,
    companyId?: string,
  ): Promise<{ created: number; errors: Array<{ row: number; message: string; data: any }> }> {
    const errors: Array<{ row: number; message: string; data: any }> = [];
    let created = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, row 1 is header

      // Validate required fields
      if (!row.code) { errors.push({ row: rowNum, message: 'Code is required', data: row }); continue; }
      if (!row.name) { errors.push({ row: rowNum, message: 'Name is required', data: row }); continue; }
      if (!row.categoryId) { errors.push({ row: rowNum, message: 'Category is required', data: row }); continue; }
      if (!row.uomId) { errors.push({ row: rowNum, message: 'UOM is required', data: row }); continue; }

      // Check duplicate
      const existing = await this.itemRepo.findOne({
        where: { code: row.code, companyId: companyId || null },
      });
      if (existing) {
        errors.push({ row: rowNum, message: `Duplicate code: "${row.code}"`, data: row });
        continue;
      }

      try {
        const item = this.itemRepo.create({ ...row, companyId });
        await this.itemRepo.save(item);
        created++;
      } catch (err: any) {
        errors.push({ row: rowNum, message: err.message, data: row });
      }
    }

    return { created, errors };
  }
}
