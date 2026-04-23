import {Controller, Get, Param, Patch, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {NotificationsService} from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: number, @CurrentUser('somiteeId') somiteeId: number) {
    return this.service.markRead(id, somiteeId);
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser('somiteeId') somiteeId: number) {
    return this.service.markAllRead(somiteeId);
  }
}
