import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('item_masters')
export class ItemMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  uomId: string;

  @Column({ nullable: true })
  hsnCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  gstRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
