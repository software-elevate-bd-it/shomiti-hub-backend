import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiParam} from '@nestjs/swagger';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {CollectionsService} from './collections.service';
import {ListCollectionQueryDto} from './dto/list-collection-query.dto';
import {UpdateTransactionDto} from './dto/update-transaction-dto';
import {ChangeTransactionStatusDto} from './dto/change.transaction.status-dto';
import {CreateCollectionDto} from './dto/create-collection.dto';

@ApiTags('Collections')
@ApiBearerAuth('Authorization')
@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  // ====================== Get Collection List ======================
  // FIX: add detailed API documentation with query parameter descriptions and examples
  // FIX: ensure proper validation of query parameters using DTOs and class-validator
  // FIX: add error handling for invalid query parameters and log errors
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'List collections (payments) with filters & pagination'})
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListCollectionQueryDto) {
    return this.service.listCollections(somiteeId, query);
  }

  // ==================== Create Collection ======================
  // FIX: add detailed API documentation with request body schema and examples
  // FIX: ensure proper validation of request body using DTOs and class-validator
  // FIX: add error handling for validation failures and log errors
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Create collection (single or multi-month)'})
  async create(
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: CreateCollectionDto,
  ) {
    return this.service.createCollection(somiteeId, userId, body);
  }

  // ==================== Update Collection ======================
  // FIX: add detailed API documentation with request body schema and examples
  // FIX: ensure proper validation of request body using DTOs and class-validator
  // FIX: add error handling for validation failures and log errors

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Update transaction by id. Allows updating amount, method, category, transactionId, note, and status.',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.service.update(Number(id), somiteeId, userId, body);
  }

  // ==================== Delete Collection ======================
  // FIX: add detailed API documentation with path parameter description and examples
  // FIX: add error handling for invalid transaction ID and log errors

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Delete transaction by id.  '})
  async remove(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: number) {
    return this.service.remove(Number(id), somiteeId);
  }

  // ==================== Change Transaction Status ======================
  // FIX: add detailed API documentation with path parameter and request body schema descriptions and examples
  // FIX: ensure proper validation of request body using DTOs and class-validator
  // FIX: add error handling for invalid transaction ID, validation failures, and log errors

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Change transaction status'})
  async changeStatus(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() dto: ChangeTransactionStatusDto,
  ) {
    return this.service.changeStatus(Number(id), somiteeId, dto);
  }

  @Post('public-pay/:paymentLink')
  async publicPay(@Param('paymentLink') paymentLink: string, @Body() body: any) {
    return this.service.publicPay(paymentLink, body);
  }

  @Post('public-pay/callback')
  async publicCallback(@Body() body: any) {
    return this.service.publicCallback(body);
  }

  @Post('quick-pay')
  async quickPay(@Body() body: any) {
    return this.service.quickPay(body);
  }

  // ==================== Member Payment Statistics ======================
  // FIX: add detailed API documentation with path and query parameter descriptions and examples
  // FIX: ensure proper validation of path and query parameters using DTOs and class-validator
  // FIX: add error handling for invalid memberRegNumber, financialYear, validation failures, and log errors

  @Get('member-stat-count/:memberRegNumber')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get member payment statistics',
  })
  @ApiParam({
    name: 'memberRegNumber',
    example: 10001,
  })
  @ApiQuery({
    name: 'financialYear',
    example: '2025-2026',
  })
  async memberStatCount(
    @Param('memberRegNumber', new ParseIntPipe()) memberRegNumber: number,
    @Query('financialYear') financialYear: string,
  ) {
    return this.service.memberStatCount({
      memberRegNumber,
      financialYear,
    });
  }
}
