import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawMaterial } from '../raw-materials/raw-material.entity';
import { FinishedGood } from '../finished-goods/finished-good.entity';
import { ProductionOrder, ProductionStatus } from '../production/production-order.entity';
import { SalesOrder, SalesOrderStatus } from '../sales/sales-order.entity';
import { PurchaseOrder, POStatus } from '../purchase/purchase-order.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(RawMaterial) private readonly rmRepo: Repository<RawMaterial>,
    @InjectRepository(FinishedGood) private readonly fgRepo: Repository<FinishedGood>,
    @InjectRepository(ProductionOrder) private readonly prodRepo: Repository<ProductionOrder>,
    @InjectRepository(SalesOrder) private readonly soRepo: Repository<SalesOrder>,
    @InjectRepository(PurchaseOrder) private readonly poRepo: Repository<PurchaseOrder>,
  ) {}

  async getOverview(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const [rmCount, fgCount, prodCount, salesCount, poCount] = await Promise.all([
      this.rmRepo.count({ where }),
      this.fgRepo.count({ where }),
      this.prodRepo.count({ where }),
      this.soRepo.count({ where }),
      this.poRepo.count({ where }),
    ]);

    const lowStockQB = this.rmRepo.createQueryBuilder('rm').where('rm.currentStock <= rm.minimumStock');
    if (companyId) lowStockQB.andWhere('rm.companyId = :companyId', { companyId });
    const lowStockRM = await lowStockQB.getCount();

    const activeProduction = await this.prodRepo.count({ where: { ...where, status: ProductionStatus.IN_PROGRESS } });
    const pendingDispatch = await this.soRepo.count({ where: { ...where, status: SalesOrderStatus.CONFIRMED } });
    const pendingPOs = await this.poRepo.count({ where: { ...where, status: POStatus.SENT } });

    return {
      rawMaterials: rmCount,
      finishedGoods: fgCount,
      productionOrders: prodCount,
      salesOrders: salesCount,
      purchaseOrders: poCount,
      alerts: { lowStockRM, activeProduction, pendingDispatch, pendingPOs },
    };
  }

  async getInventoryHealth(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const rawMaterials = await this.rmRepo.find({ where });
    const finishedGoods = await this.fgRepo.find({ where });
    return {
      rawMaterials: rawMaterials.map((rm) => ({
        id: rm.id,
        name: rm.name,
        currentStock: rm.currentStock,
        minimumStock: rm.minimumStock,
        status: Number(rm.currentStock) <= Number(rm.minimumStock) ? 'critical' : Number(rm.currentStock) <= Number(rm.minimumStock) * 1.5 ? 'low' : 'healthy',
      })),
      finishedGoods: finishedGoods.map((fg) => ({
        id: fg.id,
        sku: fg.sku,
        name: fg.name,
        currentStock: fg.currentStock,
        qualityStatus: fg.qualityStatus,
      })),
    };
  }

  async getProductionEfficiency(companyId?: string) {
    const where: any = { status: ProductionStatus.COMPLETED };
    if (companyId) where.companyId = companyId;
    const completed = await this.prodRepo.find({ where });
    const efficiency = completed.map((p) => ({
      orderNumber: p.orderNumber,
      planned: p.plannedQuantity,
      actual: p.actualQuantity,
      wastage: p.wastageQuantity,
      efficiency: p.plannedQuantity > 0 ? ((Number(p.actualQuantity) / Number(p.plannedQuantity)) * 100).toFixed(2) : 0,
    }));
    return efficiency;
  }

  async getSalesTrend(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const orders = await this.soRepo.find({ where, order: { createdAt: 'DESC' } });
    const trend: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!trend[date]) trend[date] = { date, revenue: 0, orders: 0 };
      trend[date].revenue += Number(order.totalAmount);
      trend[date].orders++;
    }
    return Object.values(trend).sort((a, b) => a.date.localeCompare(b.date));
  }
}
