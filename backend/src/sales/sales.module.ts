import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder, Customer } from './sales-order.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { FinishedGoodsModule } from '../finished-goods/finished-goods.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, Customer]), FinishedGoodsModule, RealtimeModule],
  providers: [SalesService],
  controllers: [SalesController],
  exports: [SalesService],
})
export class SalesModule {}
