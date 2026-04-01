import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email }, select: ['id', 'email', 'name', 'role', 'isActive', 'password', 'branch', 'companyId'] });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(companyId?: string): Promise<User[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.usersRepo.find({ where, order: { name: 'ASC' } });
  }

  async countByCompany(companyId: string): Promise<number> {
    return this.usersRepo.count({ where: { companyId } });
  }

  async activateByCompany(companyId: string): Promise<void> {
    await this.usersRepo.update({ companyId }, { isActive: true });
  }

  async deactivateByCompany(companyId: string): Promise<void> {
    await this.usersRepo.update({ companyId }, { isActive: false });
  }

  async create(data: Partial<User>, companyId?: string): Promise<User> {
    // Enforce user limit for the company
    if (data.companyId || companyId) {
      const cid = data.companyId || companyId;
      // User limit check is handled in CompaniesService before calling this
    }
    const hashed = await bcrypt.hash(data.password!, 10);
    const user = this.usersRepo.create({ ...data, password: hashed, companyId: data.companyId || companyId });
    return this.usersRepo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepo.delete(id);
  }
}

