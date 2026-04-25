import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {ActivityLogService} from './activity-log.service';
import {ApiTags, ApiOperation, ApiBearerAuth} from '@nestjs/swagger';
import {ListActivityLogDto} from './dto/list-activity-log.dto';

@ApiTags('Activeity Log')
@ApiBearerAuth('Authorization')
@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get activity log list'})
  async list(@Query() query: ListActivityLogDto) {
    return this.service.list(query);
  }
}
