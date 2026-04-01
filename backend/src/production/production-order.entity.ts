import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProductionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('production_orders')
export class ProductionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column()
  recipeId: string;

  @Column()
  recipeName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  plannedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  wastageQuantity: number;

  @Column({ type: 'enum', enum: ProductionStatus, default: ProductionStatus.PLANNED })
  status: ProductionStatus;

  @Column({ nullable: true })
  batchNumber: string;

  @Column({ nullable: true })
  assignedOperator: string;

  @Column({ nullable: true })
  assignedMachine: string;

  @Column({ nullable: true })
  plannedStartDate: Date;

  @Column({ nullable: true })
  actualStartDate: Date;

  @Column({ nullable: true })
  completionDate: Date;

  @Column({ type: 'jsonb', default: [] })
  issuedMaterials: {
    materialId: string;
    materialName: string;
    requiredQuantity: number;
    issuedQuantity: number;
    unit: string;
  }[];

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
