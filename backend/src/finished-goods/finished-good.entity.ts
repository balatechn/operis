import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum QualityStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HOLD = 'hold',
  PENDING = 'pending',
}

@Entity('finished_goods')
export class FinishedGood {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column()
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'enum', enum: QualityStatus, default: QualityStatus.PENDING })
  qualityStatus: QualityStatus;

  @Column({ type: 'jsonb', default: [] })
  batches: {
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    productionDate: string;
    qualityStatus: QualityStatus;
  }[];

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
