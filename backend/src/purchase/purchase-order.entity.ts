import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { GRN } from './grn.entity';

export enum POStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIAL = 'partial',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  poNumber: string;

  @ManyToOne(() => Vendor, { eager: true })
  @JoinColumn()
  vendor: Vendor;

  @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
  status: POStatus;

  @Column({ type: 'jsonb', default: [] })
  items: {
    materialId: string;
    materialName: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice: number;
    unit: string;
  }[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  expectedDeliveryDate: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  companyId: string;

  @OneToMany(() => GRN, (grn) => grn.purchaseOrder)
  grns: GRN[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
