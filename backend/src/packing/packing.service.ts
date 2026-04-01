import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackingOrder } from './packing-order.entity';
import { FinishedGoodsService } from '../finished-goods/finished-goods.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class PackingService {
  constructor(
    @InjectRepository(PackingOrder) private readonly packRepo: Repository<PackingOrder>,
    private readonly fgService: FinishedGoodsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async findAll(companyId?: string): Promise<PackingOrder[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.packRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<PackingOrder> {
    const order = await this.packRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Packing order not found');
    return order;
  }

  async create(data: Partial<PackingOrder>, companyId?: string): Promise<PackingOrder> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const count = await this.packRepo.count({ where });
    const packSizes = (data.packSizes || []).map((ps, idx) => ({
      ...ps,
      barcode: `OPS-${Date.now()}-${idx}`,
      skuCode: `SKU-${data.finishedGoodId?.slice(0, 4)}-${ps.size}`.toUpperCase(),
    }));
    const order = this.packRepo.create({
      ...data,
      companyId: companyId || data.companyId,
      packingOrderNumber: `PKG-${String(count + 1).padStart(5, '0')}`,
      packSizes,
    });
    return this.packRepo.save(order);
  }

  async completePackingOrder(id: string): Promise<PackingOrder> {
    const order = await this.findById(id);
    order.isCompleted = true;
    order.packingDate = new Date();
    // Update FG stock for each pack size
    for (const ps of order.packSizes) {
      const totalQty = ps.numberOfPacks;
      await this.fgService.addStock(order.finishedGoodId, {
        batchNumber: order.sourceBatchNumber,
        quantity: totalQty,
        productionDate: new Date().toISOString(),
        qualityStatus: 'pending',
      });
    }
    const saved = await this.packRepo.save(order);
    this.realtime.emitToAll('packing:completed', saved);
    return saved;
  }
}
