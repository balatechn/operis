import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinishedGood } from './finished-good.entity';
import { FinishedGoodsService } from './finished-goods.service';
import { FinishedGoodsController } from './finished-goods.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([FinishedGood]), RealtimeModule],
  providers: [FinishedGoodsService],
  controllers: [FinishedGoodsController],
  exports: [FinishedGoodsService],
})
export class FinishedGoodsModule {}
