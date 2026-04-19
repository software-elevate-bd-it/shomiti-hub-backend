import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  async stats(@CurrentUser('somiteeId') somiteeId: string) {
    return this.service.stats(somiteeId);
  }

  @Get('member-stats')
  async memberStats(@CurrentUser('somiteeId') somiteeId: string, @CurrentUser('id') userId: string) {
    return this.service.memberStats(somiteeId, userId);
  }
}
