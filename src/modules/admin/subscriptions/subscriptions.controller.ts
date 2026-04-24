import {Controller, Get, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../../common/guards/jwt-auth.guard';
import {SubscriptionsService} from './subscriptions.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Admin-Subscriptions')
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get('plans')
  async plans() {
    return this.service.plans();
  }
}
