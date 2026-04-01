import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  version: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  batchSize: number;

  @Column()
  batchUnit: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  yieldPercentage: number;

  @Column({ type: 'jsonb', default: [] })
  ingredients: {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
    isSubRecipe: boolean;
    subRecipeId?: string;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPerBatch: number;

  @Column({ nullable: true })
  finishedGoodSku: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
