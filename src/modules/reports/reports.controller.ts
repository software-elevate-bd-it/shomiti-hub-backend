import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {ReportsService} from './reports.service';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import {IncomeVsExpenseDto} from './dto/income-vs-expense.dto';
import {CashFlowDto} from './dto/cash-flow.dto';
import {MemberDuesDto} from './dto/member-dues.dto';
import {BankVsCashDto} from './dto/bank-vs-cash.dto';
import { CollectionReportDto } from './dto/collection-report.dto';

@ApiTags('Reports')
@ApiBearerAuth('Authorization')
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  // GET /reports/income-vs-expense?dateFrom=2026-01-01&dateTo=2026-12-31&groupBy=monthly
  // GET /reports/income-vs-expense

  @Get('income-vs-expense')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Income vs Expense report'})
  async incomeVsExpense(
    @CurrentUser('somiteeId') somiteeId: number,
    @Query() query: IncomeVsExpenseDto,
  ) {
    return this.service.incomeVsExpense(somiteeId, query);
  }

  // GET /reports/cash-flow?dateFrom=2026-01-01&dateTo=2026-12-31&groupBy=daily
  // GET /reports/cash-flow
  // groupBy can be daily or monthly
  // For daily, group by date
  // For monthly, group by year and month
  // Response should include total cash inflow, total cash outflow, net cash flow, and breakdown by date
  @Get('cash-flow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Cash flow report'})
  async cashFlow(@CurrentUser('somiteeId') somiteeId: number, @Query() query: CashFlowDto) {
    return this.service.cashFlow(somiteeId, query);
  }

  // GET /reports/member-dues?page=1&limit=10&status=active&search=karim
  // Response should include list of members with due > 0, total due amount, and pagination info
  // status can be active, inactive, pending
  // search should look into member name, phone, and shop name
  // Results should be sorted by total due amount in descending order
  @Get('member-dues')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Member dues report'})
  async memberDues(@CurrentUser('somiteeId') somiteeId: number, @Query() query: MemberDuesDto) {
    return this.service.memberDues(somiteeId, query);
  }

  @Get('bank-vs-cash')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Bank vs Cash report'})
  async bankVsCash(@CurrentUser('somiteeId') somiteeId: number, @Query() query: BankVsCashDto) {
    return this.service.bankVsCash(somiteeId, query);
  }

  @Get('collection')
  @UseGuards(JwtAuthGuard)
  async collection(
    @CurrentUser('somiteeId') somiteeId: number,
    @Query() query: CollectionReportDto,
  ) {
    return this.service.collection(somiteeId, query);
  }

  @Get('export')
  async export(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.export(somiteeId, query);
  }
}
