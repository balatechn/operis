import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('packing_orders')
export class PackingOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  packingOrderNumber: string;

  @Column()
  finishedGoodId: string;

  @Column()
  finishedGoodName: string;

  @Column()
  sourceBatchNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  bulkQuantity: number;

  @Column({ type: 'jsonb', default: [] })
  packSizes: {
    size: string;
    unit: string;
    numberOfPacks: number;
    barcode: string;
    skuCode: string;
  }[];

  @Column({ nullable: true })
  packingDate: Date;

  @Column({ nullable: true })
  packedBy: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
