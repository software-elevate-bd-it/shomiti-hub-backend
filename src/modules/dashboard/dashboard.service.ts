import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: Add date filter and other relevant filters in the future
  // For now, it will return overall stats for the somitee
  // We can later enhance it to return stats for a specific month, year, or custom date range
  // We can also add more stats like monthly fee collection, payment link usage, etc.
  // We can also add more detailed stats like payment trends, member growth, etc.
  // We can also add more filters like member category, payment method, etc.
  async stats(somiteeId: number) {
    try {
      const [payments, expenses, members, bankAccounts, recentTransactions] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {amount: true},
          _count: {id: true},
        }),

        this.prisma.expense.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {amount: true},
        }),

        this.prisma.member.count({
          where: {
            somiteeId: BigInt(somiteeId),
            status: 'active',
          },
        }),

        this.prisma.bankAccount.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {balance: true},
        }),

        this.prisma.transaction.findMany({
          where: {somiteeId: BigInt(somiteeId)},
          orderBy: {createdAt: 'desc'},
          take: 10,
        }),
      ]);

      const totalIncome = payments._sum.amount || 0;
      const totalExpense = expenses._sum.amount || 0;

      return {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,

        totalBankBalance: bankAccounts._sum.balance || 0,
        cashInHand: 0,

        totalMembers: members,
        activeMembers: members,

        totalPayments: payments._count.id || 0,

        recentTransactions,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('dashboard.stats error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
        });
      }

      throw new InternalServerErrorException('Failed to load dashboard stats');
    }
  }

  async memberStats(somiteeId: number) {
    try {
      const [totalPaid, totalDue, lastPayment, recentPayments] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {amount: true},
        }),

        this.prisma.member.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {totalDue: true},
        }),

        this.prisma.payment.findFirst({
          where: {somiteeId: BigInt(somiteeId)},
          orderBy: {paymentDate: 'desc'},
        }),

        this.prisma.payment.findMany({
          where: {somiteeId: BigInt(somiteeId)},
          orderBy: {paymentDate: 'desc'},
          take: 5,
        }),
      ]);

      const paid = totalPaid._sum.amount || 0;
      const due = totalDue._sum.totalDue || 0;

      return {
        totalPaid: paid,
        totalDue: due,
        balance: paid - due,

        lastPaymentDate: lastPayment?.paymentDate || null,
        lastPaymentAmount: lastPayment?.amount || 0,

        recentPayments,

        monthlyFee: null, // TODO: later derive from Member model
        paymentLink: null,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('memberStats error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
        });
      }

      throw new InternalServerErrorException('Failed to load member stats');
    }
  }
}
