import { Body, Controller, Get, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { SmsService } from './sms.service';

@Controller('sms')
@UseGuards(JwtAuthGuard)
export class SmsController {
  constructor(private readonly service: SmsService) {}

  @Get('templates')
  async templates() {
    return this.service.templates();
  }

  @Post('send')
  async send(@Body() body: any) {
    return this.service.send(body);
  }

  @Post('send-custom')
  async sendCustom(@Body() body: any) {
    return this.service.sendCustom(body);
  }

  @Get('history')
  async history(@CurrentUser('somiteeId') somiteeId: string, @Query() query: any) {
    return this.service.history(somiteeId, query);
  }

  @Put('config')
  @ApiBody({ schema: { example: { provider: 'twilio', apiKey: 'abc123', senderId: 'SOMITEE', autoSendOnPayment: true } } })
  async config(@CurrentUser('somiteeId') somiteeId: string, @Body() body: any) {
    return this.service.config(somiteeId, body);
  }
}
