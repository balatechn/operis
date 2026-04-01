import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PurchaseOrder } from '../purchase/purchase-order.entity';
import { GRN } from '../purchase/grn.entity';
import { RawMaterial } from '../raw-materials/raw-material.entity';
import { ProductionOrder } from '../production/production-order.entity';
import { FinishedGood } from '../finished-goods/finished-good.entity';
import { PackingOrder } from '../packing/packing-order.entity';
import { SalesOrder } from '../sales/sales-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder, GRN, RawMaterial, ProductionOrder, FinishedGood, PackingOrder, SalesOrder,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
