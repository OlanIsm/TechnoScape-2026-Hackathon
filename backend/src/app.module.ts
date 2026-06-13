import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SupplierModule } from './supplier/supplier.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { VolumemindModule } from './volumemind/volumemind.module';

@Module({
  imports: [PrismaModule, UsersModule, SupplierModule, OrderModule, AuthModule, DashboardModule, VolumemindModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
