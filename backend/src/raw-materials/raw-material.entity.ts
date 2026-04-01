import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StockMethod {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
  FEFO = 'FEFO',
}

@Entity('raw_materials')
export class RawMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

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
  reorderLevel: number;

  @Column({ type: 'enum', enum: StockMethod, default: StockMethod.FEFO })
  stockMethod: StockMethod;

  @Column({ nullable: true })
  warehouse: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'jsonb', default: [] })
  batches: {
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    receivedDate: string;
    unitCost: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageCost: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
