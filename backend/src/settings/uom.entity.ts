import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UomType {
  WEIGHT = 'weight',
  VOLUME = 'volume',
  COUNT = 'count',
  LENGTH = 'length',
  AREA = 'area',
}

@Entity('units_of_measurement')
export class UnitOfMeasurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string; // e.g., KG, LTR, PCS

  @Column()
  name: string; // e.g., Kilogram, Litre, Pieces

  @Column({ type: 'enum', enum: UomType, default: UomType.COUNT })
  type: UomType;

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
