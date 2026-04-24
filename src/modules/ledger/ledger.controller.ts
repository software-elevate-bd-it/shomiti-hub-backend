import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {LedgerService} from './ledger.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Ledger')
@Controller('ledger')
@UseGuards(JwtAuthGuard)
export class LedgerController {
  constructor(private readonly service: LedgerService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Get('summary')
  async summary(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.summary(somiteeId, query);
  }
}
