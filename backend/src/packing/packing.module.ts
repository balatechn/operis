import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackingOrder } from './packing-order.entity';
import { PackingService } from './packing.service';
import { PackingController } from './packing.controller';
import { FinishedGoodsModule } from '../finished-goods/finished-goods.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([PackingOrder]), FinishedGoodsModule, RealtimeModule],
  providers: [PackingService],
  controllers: [PackingController],
  exports: [PackingService],
})
export class PackingModule {}
