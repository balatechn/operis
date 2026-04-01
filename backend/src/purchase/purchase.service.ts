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
  async createPO(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const count = await this.poRepo.count();
    const po = this.poRepo.create({
      ...data,
      poNumber: `PO-${String(count + 1).padStart(5, '0')}`,
    });
    const saved = await this.poRepo.save(po);
    this.realtime.emitToAll('po:created', saved);
    return saved;
  }

  async findAllPOs(): Promise<PurchaseOrder[]> {
    return this.poRepo.find({ order: { createdAt: 'DESC' } });
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
  async createGRN(data: Partial<GRN>): Promise<GRN> {
    const count = await this.grnRepo.count();
    const grn = this.grnRepo.create({
      ...data,
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

  async findAllGRNs(): Promise<GRN[]> {
    return this.grnRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Vendor Methods
  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    const vendor = this.vendorRepo.create(data);
    return this.vendorRepo.save(vendor);
  }

  async findAllVendors(): Promise<Vendor[]> {
    return this.vendorRepo.find({ order: { name: 'ASC' } });
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
