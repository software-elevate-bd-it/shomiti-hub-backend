import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }
}
