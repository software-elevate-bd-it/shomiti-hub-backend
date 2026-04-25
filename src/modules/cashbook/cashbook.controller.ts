import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {CashbookService} from './cashbook.service';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {ListCashbookQueryDto} from './dto/list-cashbook-query.dto';

@ApiTags('Cashbook')
@ApiBearerAuth('Authorization')
@Controller('cashbook')
@UseGuards(JwtAuthGuard)
export class CashbookController {
  constructor(private readonly service: CashbookService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListCashbookQueryDto) {
    return this.service.list(somiteeId, query);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async summary(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListCashbookQueryDto) {
    return this.service.summary(somiteeId, query);
  }
}
