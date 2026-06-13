import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { VolumemindModule } from '../volumemind/volumemind.module';

@Module({
  imports: [PrismaModule, VolumemindModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
