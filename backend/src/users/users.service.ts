import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.usersRepo.findOne({ where: { email }, select: ['id', 'email', 'name', 'role', 'isActive', 'password', 'branch'] });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async create(data: Partial<User>): Promise<User> {
    const hashed = await bcrypt.hash(data.password!, 10);
    const user = this.usersRepo.create({ ...data, password: hashed });
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
