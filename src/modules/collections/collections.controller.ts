import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  @Get()
  async list(@CurrentUser('somiteeId') somiteeId: string, @Query() query: any) {
    return this.service.list(somiteeId, query);
  }

  @Post()
  async create(@CurrentUser('somiteeId') somiteeId: string, @Body() body: any) {
    return this.service.create(somiteeId, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string, @Body() body: any) {
    return this.service.update(id, somiteeId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('somiteeId') somiteeId: string) {
    return this.service.remove(id, somiteeId);
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @CurrentUser('somiteeId') somiteeId: string,
    @Body() body: any
  ) {
    return this.service.changeStatus(id, somiteeId, body);
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

  @Get('member-status/:memberId')
  async memberStatus(@Param('memberId') memberId: string, @Query('financialYear') financialYear: string) {
    return this.service.memberStatus(memberId, financialYear);
  }
}
