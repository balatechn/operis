import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterial } from './raw-material.entity';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterialsController } from './raw-materials.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([RawMaterial]), RealtimeModule],
  providers: [RawMaterialsService],
  controllers: [RawMaterialsController],
  exports: [RawMaterialsService],
})
export class RawMaterialsModule {}
