import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySummary() {
    try {
      this.logger.log('Running daily summary aggregation task');
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - 1);
      date.setUTCHours(0, 0, 0, 0);
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

      const tenants = await this.prisma.somitee.findMany({select: {id: true}});
      for (const tenant of tenants) {
        const [payments, expenses] = await Promise.all([
          this.prisma.payment.aggregate({
            where: {somiteeId: tenant.id, paymentDate: {gte: startOfDay, lt: endOfDay}},
            _sum: {amount: true},
          }),
          this.prisma.expense.aggregate({
            where: {somiteeId: tenant.id, date: {gte: startOfDay, lt: endOfDay}},
            _sum: {amount: true},
          }),
        ]);

        await this.prisma.statsSummary.upsert({
          where: {
            somiteeId_date_periodType: {
              somiteeId: tenant.id,
              date: startOfDay,
              periodType: 'daily',
            },
          },
          create: {
            somiteeId: tenant.id,
            date: startOfDay,
            periodType: 'daily',
            totalCollection: payments._sum.amount || 0,
            totalExpense: expenses._sum.amount || 0,
            totalDue: 0,
            createdById: 1,
          },
          update: {
            totalCollection: payments._sum.amount || 0,
            totalExpense: expenses._sum.amount || 0,
          },
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('scheduler.service.service.handleDailySummary error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('scheduler.service.service.handleDailySummary unknown error:', error);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to handleDailySummary');
    }
  }

  @Cron('0 0 0 1 * *')
  async handleMonthlyAggregation() {
    try {
      this.logger.log('Running monthly aggregation task');
      const now = new Date();
      const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      const firstDayNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      const tenants = await this.prisma.somitee.findMany({select: {id: true}});
      for (const tenant of tenants) {
        const [payments, expenses] = await Promise.all([
          this.prisma.payment.aggregate({
            where: {
              somiteeId: tenant.id,
              paymentDate: {gte: firstDayOfMonth, lt: firstDayNextMonth},
            },
            _sum: {amount: true},
          }),
          this.prisma.expense.aggregate({
            where: {somiteeId: tenant.id, date: {gte: firstDayOfMonth, lt: firstDayNextMonth}},
            _sum: {amount: true},
          }),
        ]);

        await this.prisma.statsSummary.upsert({
          where: {
            somiteeId_date_periodType: {
              somiteeId: tenant.id,
              date: firstDayOfMonth,
              periodType: 'monthly',
            },
          },
          create: {
            somiteeId: tenant.id,
            date: firstDayOfMonth,
            periodType: 'monthly',
            totalCollection: payments._sum.amount || 0,
            totalExpense: expenses._sum.amount || 0,
            totalDue: 0,
            createdById: 1,
          },
          update: {
            totalCollection: payments._sum.amount || 0,
            totalExpense: expenses._sum.amount || 0,
          },
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('scheduler.service.service.handleMonthlyAggregation error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('scheduler.service.service.handleMonthlyAggregation unknown error:', error);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to handleMonthlyAggregation');
    }
  }
}
