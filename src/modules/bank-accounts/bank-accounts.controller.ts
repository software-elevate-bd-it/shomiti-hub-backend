import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {BankAccountsService} from './bank-accounts.service';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {ListBankAccountDto} from './dto/list-bank-account.dto';
import {BankTransactionDto} from './dto/bank-transaction.dto';
import {TransferDto} from './dto/transfer.dto';
import {CreateBankAccountDto} from './dto/create-bank-account.dto';
import {UpdateBankAccountDto} from './dto/update-bank-account.dto';

@ApiTags('Bank Accounts')
@ApiBearerAuth('Authorization')
@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  // Get All List
  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListBankAccountDto) {
    return this.service.list(somiteeId, query);
  }

  // Create New Bank Account for Somitee
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: CreateBankAccountDto,
  ) {
    return this.service.create(somiteeId, userId, body);
  }

  // Update Bank Account
  // Only bankName, accountName, accountNumber can be updated
  // ⚠️ never freely update balance in accounting system
  // for balance correction, use deposit/withdraw with proper note
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: UpdateBankAccountDto,
  ) {
    return this.service.update(Number(id), somiteeId, body);
  }

  @Post(':id/deposit')
  @UseGuards(JwtAuthGuard)
  async deposit(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: BankTransactionDto,
  ) {
    return this.service.deposit(Number(id), somiteeId, userId, body);
  }
  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  async withdraw(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: BankTransactionDto,
  ) {
    return this.service.withdraw(Number(id), somiteeId, userId, body);
  }

  @Post(':id/transfer')
  @UseGuards(JwtAuthGuard)
  async transfer(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: TransferDto,
  ) {
    return this.service.transfer(Number(id), somiteeId, userId, body);
  }
}
