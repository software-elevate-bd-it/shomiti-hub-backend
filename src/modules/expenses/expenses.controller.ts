import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {ExpensesService} from './expenses.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Post()
  async create(
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: any,
  ) {
    return this.service.create(somiteeId, body);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: any,
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
