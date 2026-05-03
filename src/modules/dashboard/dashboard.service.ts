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
      const now = new Date();

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const [
        payments,
        expenses,
        members,
        bankAccounts,
        recentTransactions,
        monthlyPayments,
        todayPayments,
        pendingMembers,
      ] = await Promise.all([
        // Total payments
        this.prisma.payment.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {amount: true},
          _count: {id: true},
        }),

        // Total expense
        this.prisma.expense.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {amount: true},
        }),

        // Total active members
        this.prisma.member.count({
          where: {
            somiteeId: BigInt(somiteeId),
            status: 'active',
          },
        }),

        // Bank balance
        this.prisma.bankAccount.aggregate({
          where: {somiteeId: BigInt(somiteeId)},
          _sum: {balance: true},
        }),

        // Recent transactions (WITH MEMBER RELATION)
        this.prisma.transaction.findMany({
          where: {somiteeId: BigInt(somiteeId)},
          orderBy: {createdAt: 'desc'},
          take: 10,
          include: {
            member: {
              select: {
                id: true,
                name: true,
                shopName: true,
              },
            },
          },
        }),

        // Monthly collection
        this.prisma.payment.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            paymentDate: {
              gte: startOfMonth,
              lt: now,
            },
          },
          _sum: {amount: true},
        }),

        // Today collection
        this.prisma.payment.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            paymentDate: {
              gte: startOfToday,
              lt: endOfToday,
            },
          },
          _sum: {amount: true},
        }),

        // Pending due base
        this.prisma.member.findMany({
          where: {somiteeId: BigInt(somiteeId)},
          select: {
            totalDue: true,
            totalPaid: true,
          },
        }),
      ]);

      const totalIncome = payments._sum.amount || 0;
      const totalExpense = expenses._sum.amount || 0;

      const pendingDue = pendingMembers.reduce((sum, m) => {
        return sum + (m.totalDue - m.totalPaid);
      }, 0);

      // 🔥 ENRICH TRANSACTIONS WITH FALLBACK NAME
      const enrichedTransactions = recentTransactions.map((t) => {
        return {
          ...t,
          memberName: t.member?.name || t.member?.shopName || t.memberName || 'Unknown Member',
        };
      });

      return {
        // OLD
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,

        totalBankBalance: bankAccounts._sum.balance || 0,
        cashInHand: 0,

        totalMembers: members,
        activeMembers: members,

        totalPayments: payments._count.id || 0,

        // NEW
        monthlyCollection: monthlyPayments._sum.amount || 0,
        todayCollection: todayPayments._sum.amount || 0,
        pendingDue,

        // FIXED
        recentTransactions: enrichedTransactions,
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
