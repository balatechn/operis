import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(companyId?: string, type?: CategoryType): Promise<Category[]> {
    const where: any = { isActive: true };
    if (companyId) where.companyId = companyId;
    if (type) where.type = type;
    return this.categoryRepo.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Category> {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(data: Partial<Category>, companyId?: string): Promise<Category> {
    const existing = await this.categoryRepo.findOne({
      where: { name: data.name, type: data.type, companyId: companyId || null },
    });
    if (existing) throw new ConflictException(`Category "${data.name}" already exists for this type`);
    const cat = this.categoryRepo.create({ ...data, companyId });
    return this.categoryRepo.save(cat);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    await this.categoryRepo.update(id, data);
    return this.findById(id);
  }

  async deactivate(id: string): Promise<Category> {
    await this.categoryRepo.update(id, { isActive: false });
    return this.findById(id);
  }
}
