import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async incomeVsExpense(somiteeId: string, query: any) {
    const [income, expense] = await Promise.all([
      this.prisma.payment.aggregate({ where: { somiteeId }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { somiteeId }, _sum: { amount: true } })
    ]);
    return {
      summary: { totalIncome: income._sum.amount || 0, totalExpense: expense._sum.amount || 0, netProfit: (income._sum.amount || 0) - (expense._sum.amount || 0) },
      breakdown: [],
      incomeByCategory: [],
      expenseByCategory: []
    };
  }

  async cashFlow(somiteeId: string, query: any) {
    return { openingBalance: 0, closingBalance: 0, totalInflow: 0, totalOutflow: 0, daily: [] };
  }

  async memberDues(somiteeId: string, query: any) {
    const dueAggregate = await this.prisma.member.aggregate({ where: { somiteeId }, _sum: { totalDue: true } });
    return { totalDue: dueAggregate._sum.totalDue || 0, membersWithDue: 0, members: [] };
  }

  async bankVsCash(somiteeId: string, query: any) {
    const bankBalance = await this.prisma.bankAccount.aggregate({ where: { somiteeId }, _sum: { balance: true } });
    return { cashInHand: 0, totalBankBalance: bankBalance._sum.balance || 0, totalAssets: bankBalance._sum.balance || 0, bankAccounts: [] };
  }

  async collection(somiteeId: string, query: any) {
    return { totalCollected: 0, totalPending: 0, byMethod: [], byCategory: [] };
  }

  async export(somiteeId: string, query: any) {
    return { type: query.type, format: query.format, fileUrl: 'export-file-url' };
  }
}
