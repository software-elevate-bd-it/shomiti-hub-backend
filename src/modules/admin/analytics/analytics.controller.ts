import {Controller, Get, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../../common/guards/jwt-auth.guard';
import {AnalyticsService} from './analytics.service';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  async overview() {
    return this.service.overview();
  }

  @Get('revenue')
  async revenue() {
    return this.service.revenue();
  }
}
