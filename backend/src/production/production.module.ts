import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrder } from './production-order.entity';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { RawMaterialsModule } from '../raw-materials/raw-materials.module';
import { RecipeModule } from '../recipe/recipe.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionOrder]), RawMaterialsModule, RecipeModule, RealtimeModule],
  providers: [ProductionService],
  controllers: [ProductionController],
  exports: [ProductionService],
})
export class ProductionModule {}
