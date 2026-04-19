import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { MemberRequestsService } from './member-requests.service';

@Controller('member-requests')
@UseGuards(JwtAuthGuard)
export class MemberRequestsController {
  constructor(private readonly service: MemberRequestsService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: string, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.service.list(somiteeId, Number(page), Number(limit));
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: string,
    @Body() body: any
  ) {
    return this.service.approve(id, somiteeId, body);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: string,
    @Body() body: any
  ) {
    return this.service.reject(id, somiteeId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string) {
    return this.service.remove(id, somiteeId);
  }
}
