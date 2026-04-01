import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CompanyStatus {
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  STANDARD = 'standard',
  ENTERPRISE = 'enterprise',
}

export const PLAN_USER_LIMITS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.BASIC]: 10,
  [SubscriptionPlan.STANDARD]: 25,
  [SubscriptionPlan.ENTERPRISE]: 100,
};

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.BASIC })
  plan: SubscriptionPlan;

  @Column({ default: 10 })
  maxUsers: number;

  @Column({ type: 'enum', enum: CompanyStatus, default: CompanyStatus.PENDING_APPROVAL })
  status: CompanyStatus;

  @Column()
  adminEmail: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  gstin: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  holdReason: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
