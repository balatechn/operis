import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UnitOfMeasurement } from './uom.entity';
import { Category } from './category.entity';
import { ItemMaster } from './item-master.entity';
import { UomService } from './uom.service';
import { CategoriesService } from './categories.service';
import { ItemsService } from './items.service';
import { UomController } from './uom.controller';
import { CategoriesController } from './categories.controller';
import { ItemsController } from './items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnitOfMeasurement, Category, ItemMaster]),
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }), // 5MB
  ],
  controllers: [UomController, CategoriesController, ItemsController],
  providers: [UomService, CategoriesService, ItemsService],
  exports: [UomService, CategoriesService, ItemsService],
})
export class SettingsModule {}
