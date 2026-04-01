import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinishedGood, QualityStatus } from './finished-good.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class FinishedGoodsService {
  constructor(
    @InjectRepository(FinishedGood) private readonly fgRepo: Repository<FinishedGood>,
    private readonly realtime: RealtimeGateway,
  ) {}

  async findAll(companyId?: string): Promise<FinishedGood[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.fgRepo.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<FinishedGood> {
    const fg = await this.fgRepo.findOne({ where: { id } });
    if (!fg) throw new NotFoundException('Finished good not found');
    return fg;
  }

  async findBySku(sku: string): Promise<FinishedGood | null> {
    return this.fgRepo.findOne({ where: { sku } });
  }

  async create(data: Partial<FinishedGood>, companyId?: string): Promise<FinishedGood> {
    const fg = this.fgRepo.create({ ...data, companyId: companyId || data.companyId });
    return this.fgRepo.save(fg);
  }

  async update(id: string, data: Partial<FinishedGood>): Promise<FinishedGood> {
    await this.fgRepo.update(id, data);
    return this.findById(id);
  }

  async addStock(id: string, batch: any): Promise<FinishedGood> {
    const fg = await this.findById(id);
    fg.batches = [...fg.batches, batch];
    fg.currentStock = Number(fg.currentStock) + Number(batch.quantity);
    const saved = await this.fgRepo.save(fg);
    this.realtime.emitToAll('fg:stock-updated', { id, currentStock: saved.currentStock });
    return saved;
  }

  async deductStock(id: string, quantity: number): Promise<FinishedGood> {
    const fg = await this.findById(id);
    fg.currentStock = Math.max(0, Number(fg.currentStock) - quantity);
    const saved = await this.fgRepo.save(fg);
    this.realtime.emitToAll('fg:stock-updated', { id, currentStock: saved.currentStock });
    return saved;
  }

  async updateQualityStatus(id: string, status: QualityStatus): Promise<FinishedGood> {
    return this.update(id, { qualityStatus: status });
  }

  async getDashboardStats(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const total = await this.fgRepo.count({ where });
    const approved = await this.fgRepo.count({ where: { ...where, qualityStatus: QualityStatus.APPROVED } });
    const hold = await this.fgRepo.count({ where: { ...where, qualityStatus: QualityStatus.HOLD } });
    return { total, approved, hold };
  }
}
