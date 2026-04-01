import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Vendor } from './vendor.entity';
import { GRN } from './grn.entity';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, Vendor, GRN]), RealtimeModule],
  providers: [PurchaseService],
  controllers: [PurchaseController],
  exports: [PurchaseService],
})
export class PurchaseModule {}
