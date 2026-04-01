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

  async getOverview() {
    const [rmCount, fgCount, prodCount, salesCount, poCount] = await Promise.all([
      this.rmRepo.count(),
      this.fgRepo.count(),
      this.prodRepo.count(),
      this.soRepo.count(),
      this.poRepo.count(),
    ]);

    const lowStockRM = await this.rmRepo
      .createQueryBuilder('rm')
      .where('rm.currentStock <= rm.minimumStock')
      .getCount();

    const activeProduction = await this.prodRepo.count({ where: { status: ProductionStatus.IN_PROGRESS } });
    const pendingDispatch = await this.soRepo.count({ where: { status: SalesOrderStatus.CONFIRMED } });
    const pendingPOs = await this.poRepo.count({ where: { status: POStatus.SENT } });

    return {
      rawMaterials: rmCount,
      finishedGoods: fgCount,
      productionOrders: prodCount,
      salesOrders: salesCount,
      purchaseOrders: poCount,
      alerts: {
        lowStockRM,
        activeProduction,
        pendingDispatch,
        pendingPOs,
      },
    };
  }

  async getInventoryHealth() {
    const rawMaterials = await this.rmRepo.find();
    const finishedGoods = await this.fgRepo.find();
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

  async getProductionEfficiency() {
    const completed = await this.prodRepo.find({ where: { status: ProductionStatus.COMPLETED } });
    const efficiency = completed.map((p) => ({
      orderNumber: p.orderNumber,
      planned: p.plannedQuantity,
      actual: p.actualQuantity,
      wastage: p.wastageQuantity,
      efficiency: p.plannedQuantity > 0 ? ((Number(p.actualQuantity) / Number(p.plannedQuantity)) * 100).toFixed(2) : 0,
    }));
    return efficiency;
  }

  async getSalesTrend() {
    const orders = await this.soRepo.find({ order: { createdAt: 'DESC' } });
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
