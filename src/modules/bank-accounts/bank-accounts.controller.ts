import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { BankAccountsService } from './bank-accounts.service';

@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: string, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Post()
  async create(@CurrentUser('somiteeId') somiteeId: string, @Body() body: any) {
    return this.service.create(somiteeId, body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: string,
    @Body() body: any
  ) {
    return this.service.update(id, somiteeId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string) {
    return this.service.remove(id, somiteeId);
  }

  @Post(':id/deposit')
  async deposit(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string, @Body() body: any) {
    return this.service.deposit(id, somiteeId, body);
  }

  @Post(':id/withdraw')
  async withdraw(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string, @Body() body: any) {
    return this.service.withdraw(id, somiteeId, body);
  }

  @Post(':id/transfer')
  async transfer(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string, @Body() body: any) {
    return this.service.transfer(id, somiteeId, body);
  }

  @Get(':id/transactions')
  async transactions(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string, @Query() query: any) {
    return this.service.transactions(id, somiteeId, query);
  }

  @Get(':id/statement')
  async statement(@Param('id') id: string, @Query() query: any) {
    return this.service.statement(id, query);
  }
}
