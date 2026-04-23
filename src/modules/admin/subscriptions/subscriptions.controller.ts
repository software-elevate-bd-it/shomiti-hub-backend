import {Controller, Get, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../../common/guards/jwt-auth.guard';
import {SubscriptionsService} from './subscriptions.service';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get('plans')
  async plans() {
    return this.service.plans();
  }
}
