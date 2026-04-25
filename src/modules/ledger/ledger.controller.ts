import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {LedgerService} from './ledger.service';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {ListLedgerQueryDto} from './dto/list-ledger-query.dto';

@ApiTags('Ledger')
@ApiBearerAuth('Authorization')
@Controller('ledger')
@UseGuards(JwtAuthGuard)
export class LedgerController {
  constructor(private readonly service: LedgerService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListLedgerQueryDto) {
    return this.service.list(somiteeId, query);
  }

  @Get('summary')
  async summary(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListLedgerQueryDto) {
    return this.service.summary(somiteeId, query);
  }
}
