import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {DashboardService} from './dashboard.service';
import {ApiBearerAuth, ApiTags, ApiOperation} from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth('Authorization')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get dashboard statistics'})
  async stats(@CurrentUser('somiteeId') somiteeId: number) {
    return this.service.stats(somiteeId);
  }

  @Get('member-stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get dashboard statistics'})
  async memberStats(@CurrentUser('somiteeId') somiteeId: number) {
    return this.service.memberStats(somiteeId);
  }
}
