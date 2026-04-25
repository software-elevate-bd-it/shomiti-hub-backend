import {Body, Controller, Get, Param, Patch, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {PaymentsService} from './payments.service';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import {ListPaymentDto} from './dto/list-payment.dto';
import {VerifyPaymentDto} from './dto/verify-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth('Authorization')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  // List payments with pagination and optional filters
  // Example: GET /payments?page=1&limit=10&status=completed&method=credit_card&memberId=123
  // Response: { data: Payment[], meta: { page: number, limit: number, total: number, totalPages: number } }
  // Handles errors and logs them appropriately
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'List (payments) with filters & pagination'})
  async list(@CurrentUser('somiteeId') somiteeId: number, @Query() query: ListPaymentDto) {
    return this.service.list(somiteeId, query);
  }

  // Verify payment (approve or reject)
  // Example: PATCH /payments/123/verify with body { "status": "approved", "remarks": "Looks good" }
  // Response: { message: string, payment: Payment }
  // Handles errors and logs them appropriately
  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Verify payment (approve or reject)'})
  async verify(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: VerifyPaymentDto,
  ) {
    return this.service.verify(Number(id), somiteeId, body);
  }
}
