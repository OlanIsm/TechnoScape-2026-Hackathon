import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

interface VolumeMindSummaryQuery {
  tanggal: string;
  id_koperasi: string;
  jenis_pupuk: string;
  curah_hujan_mm: string;
  musim_tanam: string;
  luas_lahan_hektar: string;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getDashboard(@Request() req: { user: { sub: string } }) {
    const userId: string = req.user.sub;
    return this.dashboardService.getDashboardData(userId);
  }

  @UseGuards(AuthGuard)
  @Get('volumemind-summary')
  async getVolumeMindSummary(@Query() query: VolumeMindSummaryQuery) {
    return this.dashboardService.getVolumeMindSummary(query);
  }
}
