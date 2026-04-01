import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitOfMeasurement, UomType } from './uom.entity';

@Injectable()
export class UomService {
  constructor(
    @InjectRepository(UnitOfMeasurement)
    private readonly uomRepo: Repository<UnitOfMeasurement>,
  ) {}

  async findAll(companyId?: string): Promise<UnitOfMeasurement[]> {
    const where: any = { isActive: true };
    if (companyId) where.companyId = companyId;
    return this.uomRepo.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<UnitOfMeasurement> {
    const uom = await this.uomRepo.findOne({ where: { id } });
    if (!uom) throw new NotFoundException('Unit of Measurement not found');
    return uom;
  }

  async create(data: Partial<UnitOfMeasurement>, companyId?: string): Promise<UnitOfMeasurement> {
    // Check duplicate code per company
    const existing = await this.uomRepo.findOne({
      where: { code: data.code, companyId: companyId || null },
    });
    if (existing) throw new ConflictException(`UOM code "${data.code}" already exists`);
    const uom = this.uomRepo.create({ ...data, companyId });
    return this.uomRepo.save(uom);
  }

  async update(id: string, data: Partial<UnitOfMeasurement>): Promise<UnitOfMeasurement> {
    await this.uomRepo.update(id, data);
    return this.findById(id);
  }

  async deactivate(id: string): Promise<UnitOfMeasurement> {
    await this.uomRepo.update(id, { isActive: false });
    return this.findById(id);
  }
}
