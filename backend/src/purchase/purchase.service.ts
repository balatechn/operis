import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, POStatus } from './purchase-order.entity';
import { Vendor } from './vendor.entity';
import { GRN, QCStatus } from './grn.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Vendor) private vendorRepo: Repository<Vendor>,
    @InjectRepository(GRN) private grnRepo: Repository<GRN>,
    private readonly realtime: RealtimeGateway,
  ) {}

  // PO Methods
  async createPO(data: Partial<PurchaseOrder>, companyId?: string): Promise<PurchaseOrder> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const count = await this.poRepo.count({ where });
    const po = this.poRepo.create({
      ...data,
      companyId: companyId || data.companyId,
      poNumber: `PO-${String(count + 1).padStart(5, '0')}`,
    });
    const saved = await this.poRepo.save(po);
    this.realtime.emitToAll('po:created', saved);
    return saved;
  }

  async findAllPOs(companyId?: string): Promise<PurchaseOrder[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.poRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findPOById(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({ where: { id }, relations: ['grns'] });
    if (!po) throw new NotFoundException('Purchase Order not found');
    return po;
  }

  async updatePO(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    await this.poRepo.update(id, data);
    const updated = await this.findPOById(id);
    this.realtime.emitToAll('po:updated', updated);
    return updated;
  }

  // GRN Methods
  async createGRN(data: Partial<GRN>, companyId?: string): Promise<GRN> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const count = await this.grnRepo.count({ where });
    const grn = this.grnRepo.create({
      ...data,
      companyId: companyId || data.companyId,
      grnNumber: `GRN-${String(count + 1).padStart(5, '0')}`,
    });
    return this.grnRepo.save(grn);
  }

  async approveGRN(id: string): Promise<GRN> {
    const grn = await this.grnRepo.findOne({ where: { id } });
    if (!grn) throw new NotFoundException('GRN not found');
    grn.overallQCStatus = QCStatus.APPROVED;
    const saved = await this.grnRepo.save(grn);
    this.realtime.emitToAll('grn:approved', saved);
    return saved;
  }

  async findAllGRNs(companyId?: string): Promise<GRN[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.grnRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  // Vendor Methods
  async createVendor(data: Partial<Vendor>, companyId?: string): Promise<Vendor> {
    const vendor = this.vendorRepo.create({ ...data, companyId: companyId || data.companyId });
    return this.vendorRepo.save(vendor);
  }

  async findAllVendors(companyId?: string): Promise<Vendor[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.vendorRepo.find({ where, order: { name: 'ASC' } });
  }

  async findVendorById(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    await this.vendorRepo.update(id, data);
    return this.findVendorById(id);
  }

  async deleteVendor(id: string): Promise<void> {
    await this.vendorRepo.delete(id);
  }
}
