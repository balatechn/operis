import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './recipe.entity';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { RawMaterialsModule } from '../raw-materials/raw-materials.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe]), RawMaterialsModule],
  providers: [RecipeService],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
