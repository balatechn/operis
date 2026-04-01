import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyStatus, SubscriptionPlan, PLAN_USER_LIMITS } from './company.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async register(data: {
    companyName: string;
    industry?: string;
    plan?: SubscriptionPlan;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    phone?: string;
    gstin?: string;
    address?: string;
  }): Promise<{ message: string; companyId: string }> {
    // Check if email already registered
    const existingUser = await this.usersService.findByEmail(data.adminEmail);
    if (existingUser) throw new ConflictException('Email already registered');

    const plan = data.plan || SubscriptionPlan.BASIC;
    const maxUsers = PLAN_USER_LIMITS[plan];

    const company = this.companyRepo.create({
      name: data.companyName,
      industry: data.industry,
      plan,
      maxUsers,
      adminEmail: data.adminEmail,
      phone: data.phone,
      gstin: data.gstin,
      address: data.address,
      status: CompanyStatus.PENDING_APPROVAL,
    });
    const savedCompany = await this.companyRepo.save(company);

    // Create admin user for this company
    await this.usersService.create({
      name: data.adminName,
      email: data.adminEmail,
      password: data.adminPassword,
      role: UserRole.ADMIN,
      isActive: false, // Inactive until company is approved
      companyId: savedCompany.id,
    });

    // Placeholder: notify super_admin (log for now)
    console.log(`[NOTIFICATION] New company registration: "${data.companyName}" (${data.adminEmail}) — awaiting approval`);

    return {
      message: 'Registration submitted successfully. You will be notified once approved.',
      companyId: savedCompany.id,
    };
  }

  async approve(id: string): Promise<Company> {
    const company = await this.findById(id);
    if (company.status === CompanyStatus.ACTIVE) {
      throw new BadRequestException('Company is already active');
    }
    company.status = CompanyStatus.ACTIVE;
    company.holdReason = null;
    const saved = await this.companyRepo.save(company);
    // Activate the company admin user
    await this.usersService.activateByCompany(id);
    console.log(`[NOTIFICATION] Company "${company.name}" approved — welcome email sent to ${company.adminEmail}`);
    return saved;
  }

  async hold(id: string, reason: string): Promise<Company> {
    const company = await this.findById(id);
    company.status = CompanyStatus.ON_HOLD;
    company.holdReason = reason;
    const saved = await this.companyRepo.save(company);
    console.log(`[NOTIFICATION] Company "${company.name}" placed on hold. Reason: ${reason}`);
    return saved;
  }

  async reject(id: string, reason: string): Promise<Company> {
    const company = await this.findById(id);
    company.status = CompanyStatus.REJECTED;
    company.rejectionReason = reason;
    const saved = await this.companyRepo.save(company);
    console.log(`[NOTIFICATION] Company "${company.name}" rejected. Reason: ${reason}`);
    return saved;
  }

  async suspend(id: string): Promise<Company> {
    const company = await this.findById(id);
    company.status = CompanyStatus.SUSPENDED;
    await this.usersService.deactivateByCompany(id);
    const saved = await this.companyRepo.save(company);
    console.log(`[NOTIFICATION] Company "${company.name}" suspended`);
    return saved;
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    await this.companyRepo.update(id, data);
    return this.findById(id);
  }

  async getPendingCount(): Promise<number> {
    return this.companyRepo.count({ where: { status: CompanyStatus.PENDING_APPROVAL } });
  }

  async getUserCount(companyId: string): Promise<number> {
    return this.usersService.countByCompany(companyId);
  }
}
