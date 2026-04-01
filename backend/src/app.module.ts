import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { PurchaseModule } from './purchase/purchase.module';
import { RawMaterialsModule } from './raw-materials/raw-materials.module';
import { RecipeModule } from './recipe/recipe.module';
import { ProductionModule } from './production/production.module';
import { FinishedGoodsModule } from './finished-goods/finished-goods.module';
import { PackingModule } from './packing/packing.module';
import { SalesModule } from './sales/sales.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SettingsModule } from './settings/settings.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CompaniesModule,
    PurchaseModule,
    RawMaterialsModule,
    RecipeModule,
    ProductionModule,
    FinishedGoodsModule,
    PackingModule,
    SalesModule,
    DashboardModule,
    RealtimeModule,
    SettingsModule,
    ReportsModule,
  ],
})
export class AppModule {}
