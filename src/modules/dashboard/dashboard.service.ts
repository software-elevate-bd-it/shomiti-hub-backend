import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(somiteeId: string) {
    const [payments, expenses, members, bankAccounts, recentTransactions] = await Promise.all([
      this.prisma.payment.aggregate({ where: { somiteeId }, _sum: { amount: true }, _count: { id: true } }),
      this.prisma.expense.aggregate({ where: { somiteeId }, _sum: { amount: true } }),
      this.prisma.member.count({ where: { somiteeId, status: 'active' } }),
      this.prisma.bankAccount.aggregate({ where: { somiteeId }, _sum: { balance: true } }),
      this.prisma.transaction.findMany({ where: { somiteeId }, orderBy: { createdAt: 'desc' }, take: 10 })
    ]);

    return {
      todayCollection: payments._sum.amount || 0,
      pendingDue: 0,
      totalBankBalance: bankAccounts._sum.balance || 0,
      cashInHand: 0,
      totalMembers: members,
      activeMembers: members,
      monthlyIncome: payments._sum.amount || 0,
      monthlyExpense: expenses._sum.amount || 0,
      pendingPayments: payments._count.id || 0,
      recentTransactions
    };
  }

  async memberStats(somiteeId: string, userId: string) {
    const [totalPaid, totalDue, lastPayment] = await Promise.all([
      this.prisma.payment.aggregate({ where: { somiteeId }, _sum: { amount: true } }),
      this.prisma.member.aggregate({ where: { somiteeId }, _sum: { totalDue: true } }),
      this.prisma.payment.findFirst({ where: { somiteeId }, orderBy: { paymentDate: 'desc' } })
    ]);
    return {
      totalPaid: totalPaid._sum.amount || 0,
      totalDue: totalDue._sum.totalDue || 0,
      lastPaymentDate: lastPayment?.paymentDate || null,
      lastPaymentAmount: lastPayment?.amount || 0,
      monthlyFee: 0,
      paymentLink: null,
      recentPayments: []
    };
  }
}
