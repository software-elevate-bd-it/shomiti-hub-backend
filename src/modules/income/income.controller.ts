import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from '@nestjs/common';

import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';

import {ApiBearerAuth, ApiTags, ApiOperation} from '@nestjs/swagger';

import {IncomeService} from './income.service';

import {ListIncomeQueryDto} from './dto/list-income-query.dto';
import {CreateIncomeDto} from './dto/create-income.dto';
import {UpdateIncomeDto} from './dto/update.income.dto';

@ApiTags('Income')
@ApiBearerAuth('Authorization')
@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private readonly service: IncomeService) {}

  // ====================== List Income ======================
  @Get()
  @ApiOperation({summary: 'List income with pagination, filter & search'})
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListIncomeQueryDto) {
    return this.service.list(somiteeId, query);
  }

  // ====================== Create Income ======================
  @Post()
  @ApiOperation({summary: 'Create new income (FDR, donation, interest etc.)'})
  async create(
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: CreateIncomeDto,
  ) {
    return this.service.create(somiteeId, userId, body);
  }

  // ====================== Update Income ======================
  @Put(':id')
  @ApiOperation({summary: 'Update income'})
  async update(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: UpdateIncomeDto,
  ) {
    return this.service.update(id, somiteeId, body);
  }

  // ====================== Delete Income ======================
  @Delete(':id')
  @ApiOperation({summary: 'Delete income'})
  async remove(@Param('id') id: number, @CurrentUser('somiteeId') somiteeId: number) {
    return this.service.remove(id, somiteeId);
  }

  // ====================== Income Types ======================
  @Get('types')
  @ApiOperation({summary: 'Get all income types'})
  async types() {
    return this.service.types();
  }
}
