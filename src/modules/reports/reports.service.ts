import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async incomeVsExpense(somiteeId: number, query: any) {
    try {
      const [income, expense] = await Promise.all([
        this.prisma.payment.aggregate({where: {somiteeId}, _sum: {amount: true}}),
        this.prisma.expense.aggregate({where: {somiteeId}, _sum: {amount: true}}),
      ]);
      return {
        summary: {
          totalIncome: income._sum.amount || 0,
          totalExpense: expense._sum.amount || 0,
          netProfit: (income._sum.amount || 0) - (expense._sum.amount || 0),
        },
        breakdown: [],
        incomeByCategory: [],
        expenseByCategory: [],
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.service.service.incomeVsExpense error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('reports.service.service.incomeVsExpense unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to incomeVsExpense');
    }
  }

  async cashFlow(somiteeId: number, query: any) {
    try {
      return {openingBalance: 0, closingBalance: 0, totalInflow: 0, totalOutflow: 0, daily: []};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.service.service.cashFlow error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('reports.service.service.cashFlow unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to cashFlow');
    }
  }

  async memberDues(somiteeId: number, query: any) {
    try {
      const dueAggregate = await this.prisma.member.aggregate({
        where: {somiteeId},
        _sum: {totalDue: true},
      });
      return {totalDue: dueAggregate._sum.totalDue || 0, membersWithDue: 0, members: []};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.service.service.memberDues error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('reports.service.service.memberDues unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to memberDues');
    }
  }

  async bankVsCash(somiteeId: number, query: any) {
    try {
      const bankBalance = await this.prisma.bankAccount.aggregate({
        where: {somiteeId},
        _sum: {balance: true},
      });
      return {
        cashInHand: 0,
        totalBankBalance: bankBalance._sum.balance || 0,
        totalAssets: bankBalance._sum.balance || 0,
        bankAccounts: [],
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.service.service.bankVsCash error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('reports.service.service.bankVsCash unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to bankVsCash');
    }
  }

  async collection(somiteeId: number, query: any) {
    try {
      return {totalCollected: 0, totalPending: 0, byMethod: [], byCategory: []};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.service.service.collection error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('reports.service.service.collection unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to collection');
    }
  }

  async export(somiteeId: number, query: any) {
    try {
      return {type: query.type, format: query.format, fileUrl: 'export-file-url'};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.service.service.export error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('reports.service.service.export unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to export');
    }
  }
}
