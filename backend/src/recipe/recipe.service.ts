import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './recipe.entity';
import { RawMaterialsService } from '../raw-materials/raw-materials.service';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
    private readonly rmService: RawMaterialsService,
  ) {}

  async findAll(companyId?: string): Promise<Recipe[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    return this.recipeRepo.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepo.findOne({ where: { id } });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  async create(data: Partial<Recipe>, companyId?: string): Promise<Recipe> {
    const recipe = this.recipeRepo.create({ ...data, companyId: companyId || data.companyId });
    return this.recipeRepo.save(recipe);
  }

  async update(id: string, data: Partial<Recipe>): Promise<Recipe> {
    const recipe = await this.findById(id);
    // Version bump on update
    const updated = this.recipeRepo.create({
      ...recipe,
      ...data,
      version: recipe.version + 1,
    });
    return this.recipeRepo.save(updated);
  }

  async checkRMAvailability(recipeId: string, batches: number): Promise<any> {
    const recipe = await this.findById(recipeId);
    const results = [];
    for (const ing of recipe.ingredients) {
      const needed = ing.quantity * batches;
      const rm = await this.rmService.findById(ing.materialId);
      results.push({
        materialName: ing.materialName,
        needed,
        available: rm.currentStock,
        sufficient: Number(rm.currentStock) >= needed,
        shortage: Math.max(0, needed - Number(rm.currentStock)),
      });
    }
    return { recipe, batches, ingredients: results, allSufficient: results.every((r) => r.sufficient) };
  }

  async calculateCost(recipeId: string): Promise<any> {
    const recipe = await this.findById(recipeId);
    let totalCost = 0;
    for (const ing of recipe.ingredients) {
      const rm = await this.rmService.findById(ing.materialId);
      totalCost += ing.quantity * Number(rm.averageCost);
    }
    recipe.costPerBatch = totalCost;
    await this.recipeRepo.save(recipe);
    return { ...recipe, costPerBatch: totalCost };
  }
}
