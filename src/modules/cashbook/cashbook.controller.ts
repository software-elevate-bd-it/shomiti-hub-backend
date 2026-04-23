import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {CashbookService} from './cashbook.service';

@Controller('cashbook')
@UseGuards(JwtAuthGuard)
export class CashbookController {
  constructor(private readonly service: CashbookService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Get('summary')
  async summary() {
    return this.service.summary();
  }
}
