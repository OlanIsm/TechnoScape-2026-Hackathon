import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getDashboard(@Request() req) {
    const userId = req.user.sub;
    return this.dashboardService.getDashboardData(userId);
  }

  @UseGuards(AuthGuard)
  @Get('volumemind-summary')
  async getVolumeMindSummary(@Query() query: any) {
    return this.dashboardService.getVolumeMindSummary(query);
  }
}

