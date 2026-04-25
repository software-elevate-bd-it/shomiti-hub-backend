import {Controller, Get, Param, Patch, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {NotificationsService} from './notifications.service';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import {ListNotificationDto} from './dto/list-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth('Authorization')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get notifications list'})
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListNotificationDto) {
    return this.service.list(somiteeId, query);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Mark notification as read'})
  async markRead(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: number) {
    return this.service.markRead(Number(id), somiteeId);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Mark all notifications as read'})
  async markAllRead(@CurrentUser('somiteeId') somiteeId: number) {
    return this.service.markAllRead(somiteeId);
  }
}
