import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { RawMaterial } from '../raw-materials/raw-material.entity';
import { FinishedGood } from '../finished-goods/finished-good.entity';
import { ProductionOrder } from '../production/production-order.entity';
import { SalesOrder } from '../sales/sales-order.entity';
import { PurchaseOrder } from '../purchase/purchase-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RawMaterial, FinishedGood, ProductionOrder, SalesOrder, PurchaseOrder])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
