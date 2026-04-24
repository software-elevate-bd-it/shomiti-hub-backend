import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {ExpensesService} from './expenses.service';
import {ApiBearerAuth, ApiTags, ApiOperation} from '@nestjs/swagger';
import {ListExpenseQueryDto} from './dto/list-expense-query.dto';
import {CreateExpenseDto} from './dto/create-expense.dto';
import {UpdateExpenseDto} from './dto/update.expense.dto';

@ApiTags('Expenses')
@ApiBearerAuth('Authorization')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  // ====================== Get Collection List ======================
  // ====================== Get Collection List ======================
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'List expenses with pagination & search'})
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListExpenseQueryDto) {
    return this.service.list(somiteeId, query);
  }

  // ====================== Create New Expense ======================
  @Post()
  async create(
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: CreateExpenseDto,
  ) {
    return this.service.create(somiteeId, userId, body);
  }

  // ====================== Update Expense ======================
  @Put(':id')
  async update(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: UpdateExpenseDto,
  ) {
    return this.service.update(id, somiteeId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @CurrentUser('somiteeId') somiteeId: number) {
    return this.service.remove(id, somiteeId);
  }

  @Get('categories')
  async categories() {
    return this.service.categories();
  }
}
