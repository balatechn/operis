import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

export enum QCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('grns')
export class GRN {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  grnNumber: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.grns, { eager: true })
  @JoinColumn()
  purchaseOrder: PurchaseOrder;

  @Column({ type: 'jsonb', default: [] })
  receivedItems: {
    materialId: string;
    materialName: string;
    orderedQuantity: number;
    receivedQuantity: number;
    batchNumber: string;
    expiryDate: string;
    unitPrice: number;
    qcStatus: QCStatus;
    rejectionReason?: string;
  }[];

  @Column({ type: 'enum', enum: QCStatus, default: QCStatus.PENDING })
  overallQCStatus: QCStatus;

  @Column({ nullable: true })
  receivedBy: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  warehouseLocation: string;

  @Column({ nullable: true })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
