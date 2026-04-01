import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RawMaterial } from './raw-material.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class RawMaterialsService {
  constructor(
    @InjectRepository(RawMaterial) private readonly rmRepo: Repository<RawMaterial>,
    private readonly realtime: RealtimeGateway,
  ) {}

  async findAll(companyId?: string): Promise<RawMaterial[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.rmRepo.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<RawMaterial> {
    const rm = await this.rmRepo.findOne({ where: { id } });
    if (!rm) throw new NotFoundException('Raw material not found');
    return rm;
  }

  async create(data: Partial<RawMaterial>, companyId?: string): Promise<RawMaterial> {
    const rm = this.rmRepo.create({ ...data, companyId: data.companyId || companyId });
    return this.rmRepo.save(rm);
  }

  async update(id: string, data: Partial<RawMaterial>): Promise<RawMaterial> {
    await this.rmRepo.update(id, data);
    return this.findById(id);
  }

  async addBatch(id: string, batch: any): Promise<RawMaterial> {
    const rm = await this.findById(id);
    rm.batches = [...rm.batches, batch];
    rm.currentStock = Number(rm.currentStock) + Number(batch.quantity);
    const saved = await this.rmRepo.save(rm);
    this.realtime.emitToAll('stock:updated', { id, currentStock: saved.currentStock });
    return saved;
  }

  async deductStock(id: string, quantity: number): Promise<RawMaterial> {
    const rm = await this.findById(id);
    rm.currentStock = Math.max(0, Number(rm.currentStock) - quantity);
    const saved = await this.rmRepo.save(rm);
    this.realtime.emitToAll('stock:updated', { id, currentStock: saved.currentStock });
    return saved;
  }

  async getLowStockItems(companyId?: string): Promise<RawMaterial[]> {
    const qb = this.rmRepo.createQueryBuilder('rm').where('rm.currentStock <= rm.minimumStock');
    if (companyId) qb.andWhere('rm.companyId = :companyId', { companyId });
    return qb.getMany();
  }

  async getExpiryAlerts(daysAhead = 30): Promise<any[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysAhead);
    const materials = await this.rmRepo.find();
    const alerts: any[] = [];
    for (const m of materials) {
      const nearExpiry = m.batches.filter(
        (b) => new Date(b.expiryDate) <= threshold,
      );
      if (nearExpiry.length) alerts.push({ material: m, nearExpiryBatches: nearExpiry });
    }
    return alerts;
  }

  async getDashboardStats(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const total = await this.rmRepo.count({ where });
    const low = await this.getLowStockItems(companyId);
    const expiry = await this.getExpiryAlerts(30);
    return { totalMaterials: total, lowStockCount: low.length, expiryAlertCount: expiry.length };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkAlerts() {
    const low = await this.getLowStockItems();
    if (low.length) this.realtime.emitToAll('alert:low-stock', low);
    const expiry = await this.getExpiryAlerts(30);
    if (expiry.length) this.realtime.emitToAll('alert:expiry', expiry);
  }
}
