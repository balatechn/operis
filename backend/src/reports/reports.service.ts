import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PurchaseOrder } from '../purchase/purchase-order.entity';
import { GRN } from '../purchase/grn.entity';
import { RawMaterial } from '../raw-materials/raw-material.entity';
import { ProductionOrder } from '../production/production-order.entity';
import { FinishedGood } from '../finished-goods/finished-good.entity';
import { PackingOrder } from '../packing/packing-order.entity';
import { SalesOrder } from '../sales/sales-order.entity';
import { Vendor } from '../purchase/vendor.entity';

function dateRange(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return Between(new Date(startDate), new Date(endDate + 'T23:59:59'));
  }
  if (startDate) return MoreThanOrEqual(new Date(startDate));
  if (endDate) return LessThanOrEqual(new Date(endDate + 'T23:59:59'));
  return undefined;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(GRN) private grnRepo: Repository<GRN>,
    @InjectRepository(RawMaterial) private rmRepo: Repository<RawMaterial>,
    @InjectRepository(ProductionOrder) private prodRepo: Repository<ProductionOrder>,
    @InjectRepository(FinishedGood) private fgRepo: Repository<FinishedGood>,
    @InjectRepository(PackingOrder) private packRepo: Repository<PackingOrder>,
    @InjectRepository(SalesOrder) private soRepo: Repository<SalesOrder>,
  ) {}

  async purchaseReport(companyId: string, filters: { startDate?: string; endDate?: string; vendorId?: string; status?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (filters.status) where.status = filters.status;
    const range = dateRange(filters.startDate, filters.endDate);
    if (range) where.createdAt = range;

    const orders = await this.poRepo.find({ where, order: { createdAt: 'DESC' } });
    const filtered = filters.vendorId
      ? orders.filter((o) => o.vendor?.id === filters.vendorId)
      : orders;

    const summary = {
      total: filtered.length,
      totalValue: filtered.reduce((s, o) => s + Number(o.totalAmount), 0),
      byStatus: filtered.reduce((acc: any, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}),
    };
    return { summary, orders: filtered };
  }

  async grnReport(companyId: string, filters: { startDate?: string; endDate?: string; materialId?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const range = dateRange(filters.startDate, filters.endDate);
    if (range) where.createdAt = range;

    const grns = await this.grnRepo.find({ where, order: { createdAt: 'DESC' } });
    const summary = {
      total: grns.length,
      approved: grns.filter((g) => g.overallQCStatus === 'approved').length,
      rejected: grns.filter((g) => g.overallQCStatus === 'rejected').length,
      pending: grns.filter((g) => g.overallQCStatus === 'pending').length,
    };
    return { summary, grns };
  }

  async consumptionReport(companyId: string, filters: { startDate?: string; endDate?: string; materialId?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const range = dateRange(filters.startDate, filters.endDate);
    if (range) where.createdAt = range;

    const prodOrders = await this.prodRepo.find({ where: { ...where, status: 'completed' }, order: { completionDate: 'DESC' } });

    // Aggregate material consumption
    const consumption: Record<string, { materialId: string; materialName: string; totalIssued: number; unit: string }> = {};
    for (const order of prodOrders) {
      for (const mat of order.issuedMaterials || []) {
        if (filters.materialId && mat.materialId !== filters.materialId) continue;
        if (!consumption[mat.materialId]) {
          consumption[mat.materialId] = { materialId: mat.materialId, materialName: mat.materialName, totalIssued: 0, unit: mat.unit };
        }
        consumption[mat.materialId].totalIssued += Number(mat.issuedQuantity);
      }
    }
    return { summary: { productionOrdersCount: prodOrders.length }, consumption: Object.values(consumption) };
  }

  async stockLedgerReport(companyId: string, filters: { materialId?: string; startDate?: string; endDate?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (filters.materialId) where.id = filters.materialId;

    const materials = await this.rmRepo.find({ where });
    const ledger = materials.map((rm) => ({
      id: rm.id,
      code: rm.code,
      name: rm.name,
      currentStock: rm.currentStock,
      minimumStock: rm.minimumStock,
      unit: rm.unit,
      batches: rm.batches,
      stockStatus: Number(rm.currentStock) <= Number(rm.minimumStock) ? 'low' : 'ok',
    }));
    return { summary: { totalMaterials: materials.length, lowStock: ledger.filter((l) => l.stockStatus === 'low').length }, ledger };
  }

  async productionReport(companyId: string, filters: { startDate?: string; endDate?: string; recipeId?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (filters.recipeId) where.recipeId = filters.recipeId;
    const range = dateRange(filters.startDate, filters.endDate);
    if (range) where.createdAt = range;

    const orders = await this.prodRepo.find({ where, order: { createdAt: 'DESC' } });
    const completed = orders.filter((o) => o.status === 'completed');
    const totalPlanned = orders.reduce((s, o) => s + Number(o.plannedQuantity), 0);
    const totalActual = completed.reduce((s, o) => s + Number(o.actualQuantity), 0);
    const totalWastage = completed.reduce((s, o) => s + Number(o.wastageQuantity), 0);

    return {
      summary: {
        total: orders.length,
        completed: completed.length,
        inProgress: orders.filter((o) => o.status === 'in_progress').length,
        planned: orders.filter((o) => o.status === 'planned').length,
        totalPlanned,
        totalActual,
        totalWastage,
        wastagePercent: totalActual > 0 ? ((totalWastage / totalActual) * 100).toFixed(2) : '0',
      },
      orders,
    };
  }

  async finishedGoodsReport(companyId: string, filters: { startDate?: string; endDate?: string; sku?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (filters.sku) where.sku = filters.sku;

    const goods = await this.fgRepo.find({ where, order: { name: 'ASC' } });

    // Get sales for each FG in date range
    const soWhere: any = {};
    if (companyId) soWhere.companyId = companyId;
    const range = dateRange(filters.startDate, filters.endDate);
    if (range) soWhere.createdAt = range;
    const salesOrders = await this.soRepo.find({ where: soWhere });

    const dispatched: Record<string, number> = {};
    for (const so of salesOrders.filter((s) => s.status === 'dispatched')) {
      for (const item of so.items || []) {
        if (filters.sku && item.sku !== filters.sku) continue;
        dispatched[item.finishedGoodId] = (dispatched[item.finishedGoodId] || 0) + item.quantity;
      }
    }

    const report = goods.map((fg) => ({
      id: fg.id, sku: fg.sku, name: fg.name,
      currentStock: fg.currentStock,
      dispatched: dispatched[fg.id] || 0,
      qualityStatus: fg.qualityStatus,
    }));

    return { summary: { totalSKUs: goods.length, totalStock: goods.reduce((s, g) => s + Number(g.currentStock), 0) }, report };
  }

  async salesReport(companyId: string, filters: { startDate?: string; endDate?: string; customerId?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (filters.customerId) where.customerId = filters.customerId;
    const range = dateRange(filters.startDate, filters.endDate);
    if (range) where.createdAt = range;

    const orders = await this.soRepo.find({ where, order: { createdAt: 'DESC' } });
    const delivered = orders.filter((o) => ['dispatched', 'delivered'].includes(o.status));

    const summary = {
      total: orders.length,
      totalRevenue: delivered.reduce((s, o) => s + Number(o.totalAmount), 0),
      byStatus: orders.reduce((acc: any, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {}),
      topCustomers: Object.entries(
        delivered.reduce((acc: any, o) => {
          const key = o.customerId;
          acc[key] = acc[key] || { customerName: o.customerName, revenue: 0, orders: 0 };
          acc[key].revenue += Number(o.totalAmount);
          acc[key].orders++;
          return acc;
        }, {}),
      )
        .map(([id, v]: [string, any]) => ({ id, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
    };
    return { summary, orders };
  }

  async packingReport(companyId: string, filters: { startDate?: string; endDate?: string }) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const range = dateRange(filters.startDate, filters.endDate);
    if (range) where.createdAt = range;

    const orders = await this.packRepo.find({ where, order: { createdAt: 'DESC' } });
    const completed = orders.filter((o) => o.isCompleted);

    const packSizeSummary: Record<string, number> = {};
    for (const order of completed) {
      for (const ps of order.packSizes || []) {
        const key = `${ps.size} ${ps.unit}`;
        packSizeSummary[key] = (packSizeSummary[key] || 0) + ps.numberOfPacks;
      }
    }

    return {
      summary: {
        total: orders.length,
        completed: completed.length,
        pending: orders.length - completed.length,
        packSizeSummary,
      },
      orders,
    };
  }
}
