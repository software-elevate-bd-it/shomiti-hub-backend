import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async plans() {
    try {
      return this.prisma.subscriptionPlan.findMany();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('subscriptions.service.service.plans error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('subscriptions.service.service.plans unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to plans');
    }
  }
}
