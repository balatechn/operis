import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrder, ProductionStatus } from './production-order.entity';
import { RawMaterialsService } from '../raw-materials/raw-materials.service';
import { RecipeService } from '../recipe/recipe.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrder) private readonly prodRepo: Repository<ProductionOrder>,
    private readonly rmService: RawMaterialsService,
    private readonly recipeService: RecipeService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async findAll(): Promise<ProductionOrder[]> {
    return this.prodRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<ProductionOrder> {
    const order = await this.prodRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Production order not found');
    return order;
  }

  async create(data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const count = await this.prodRepo.count();
    const batchNumber = `BATCH-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    const order = this.prodRepo.create({
      ...data,
      orderNumber: `PRD-${String(count + 1).padStart(5, '0')}`,
      batchNumber,
    });
    const saved = await this.prodRepo.save(order);
    this.realtime.emitToAll('production:created', saved);
    return saved;
  }

  async startProduction(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    const availability = await this.recipeService.checkRMAvailability(order.recipeId, 1);
    if (!availability.allSufficient) {
      throw new BadRequestException(`Insufficient raw materials: ${availability.ingredients.filter((i: any) => !i.sufficient).map((i: any) => i.materialName).join(', ')}`);
    }
    // Deduct materials
    for (const ing of availability.ingredients) {
      await this.rmService.deductStock(
        availability.recipe.ingredients.find((i: any) => i.materialName === ing.materialName)?.materialId,
        ing.needed,
      );
    }
    order.status = ProductionStatus.IN_PROGRESS;
    order.actualStartDate = new Date();
    const saved = await this.prodRepo.save(order);
    this.realtime.emitToAll('production:started', saved);
    return saved;
  }

  async completeProduction(id: string, data: { actualQuantity: number; wastageQuantity: number }): Promise<ProductionOrder> {
    const order = await this.findById(id);
    order.status = ProductionStatus.COMPLETED;
    order.actualQuantity = data.actualQuantity;
    order.wastageQuantity = data.wastageQuantity;
    order.completionDate = new Date();
    const saved = await this.prodRepo.save(order);
    this.realtime.emitToAll('production:completed', saved);
    return saved;
  }

  async getStats() {
    const total = await this.prodRepo.count();
    const planned = await this.prodRepo.count({ where: { status: ProductionStatus.PLANNED } });
    const inProgress = await this.prodRepo.count({ where: { status: ProductionStatus.IN_PROGRESS } });
    const completed = await this.prodRepo.count({ where: { status: ProductionStatus.COMPLETED } });
    return { total, planned, inProgress, completed };
  }
}
