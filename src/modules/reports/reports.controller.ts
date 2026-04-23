import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {ReportsService} from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('income-vs-expense')
  async incomeVsExpense(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.incomeVsExpense(somiteeId, query);
  }

  @Get('cash-flow')
  async cashFlow(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.cashFlow(somiteeId, query);
  }

  @Get('member-dues')
  async memberDues(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.memberDues(somiteeId, query);
  }

  @Get('bank-vs-cash')
  async bankVsCash(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.bankVsCash(somiteeId, query);
  }

  @Get('collection')
  async collection(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.collection(somiteeId, query);
  }

  @Get('export')
  async export(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.export(somiteeId, query);
  }
}
