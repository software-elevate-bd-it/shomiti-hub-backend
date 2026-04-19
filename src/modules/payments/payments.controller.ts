import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: string, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Patch(':id/verify')
  async verify(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: string,
    @Body() body: any
  ) {
    return this.service.verify(id, somiteeId, body);
  }
}
