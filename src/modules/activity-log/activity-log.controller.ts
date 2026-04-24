import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {ActivityLogService} from './activity-log.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Activeity Log')
@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }
}
