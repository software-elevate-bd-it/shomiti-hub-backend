import {Body, Controller, Get, Param, Patch, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {PaymentsService} from './payments.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Patch(':id/verify')
  async verify(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: any,
  ) {
    return this.service.verify(id, somiteeId, body);
  }
}
