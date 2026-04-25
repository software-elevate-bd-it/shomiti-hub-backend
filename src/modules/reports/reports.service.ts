import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {IncomeVsExpenseDto} from './dto/income-vs-expense.dto';
import {CashFlowDto} from './dto/cash-flow.dto';
import {MemberDuesDto} from './dto/member-dues.dto';
import {BankVsCashDto} from './dto/bank-vs-cash.dto';
import {CollectionReportDto} from './dto/collection-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /reports/income-vs-expense?dateFrom=2026-01-01&dateTo=2026-12-31&groupBy=monthly
  // GET /reports/income-vs-expense
  //  groupBy can be daily, monthly, yearly
  // For monthly, group by year and month
  // For yearly, group by year
  // For daily, group by date
  // Response should include total income, total expense, net profit, and breakdown by category and date

  async incomeVsExpense(somiteeId: number, query: IncomeVsExpenseDto) {
    try {
      const whereDate: any = {};

      if (query.dateFrom || query.dateTo) {
        whereDate.date = {};
        if (query.dateFrom) whereDate.date.gte = new Date(query.dateFrom);
        if (query.dateTo) whereDate.date.lte = new Date(query.dateTo);
      }

      const [income, expense] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            ...(whereDate.date ? {paymentDate: whereDate.date} : {}),
          },
          _sum: {amount: true},
        }),

        this.prisma.expense.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            ...(whereDate.date ? {date: whereDate.date} : {}),
          },
          _sum: {amount: true},
        }),
      ]);

      const totalIncome = income._sum.amount ?? 0;
      const totalExpense = expense._sum.amount ?? 0;

      return {
        summary: {
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
        },
        breakdown: [],
        incomeByCategory: [],
        expenseByCategory: [],
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.incomeVsExpense error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to incomeVsExpense');
    }
  }

  // GET /reports/cash-flow?dateFrom=2026-01-01&dateTo=2026-12-31&groupBy=daily
  // GET /reports/cash-flow
  // groupBy can be daily or monthly
  // For daily, group by date
  // For monthly, group by year and month
  // Response should include total cash inflow, total cash outflow, net cash flow, and breakdown by date
  async cashFlow(somiteeId: number, query: CashFlowDto) {
    try {
      const dateFilter: any = {};

      if (query.dateFrom || query.dateTo) {
        dateFilter.date = {};
        if (query.dateFrom) dateFilter.date.gte = new Date(query.dateFrom);
        if (query.dateTo) dateFilter.date.lte = new Date(query.dateTo);
      }

      const [payments, expenses, bankIn, bankOut] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            ...(query.dateFrom || query.dateTo ? {paymentDate: dateFilter.date} : {}),
          },
          _sum: {amount: true},
        }),

        this.prisma.expense.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            ...(query.dateFrom || query.dateTo ? {date: dateFilter.date} : {}),
          },
          _sum: {amount: true},
        }),

        this.prisma.bankTransaction.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            type: 'deposit',
            ...(query.dateFrom || query.dateTo ? {date: dateFilter.date} : {}),
          },
          _sum: {amount: true},
        }),

        this.prisma.bankTransaction.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            type: {in: ['withdraw', 'transfer_out']},
            ...(query.dateFrom || query.dateTo ? {date: dateFilter.date} : {}),
          },
          _sum: {amount: true},
        }),
      ]);

      const totalInflow = (payments._sum.amount ?? 0) + (bankIn._sum.amount ?? 0);

      const totalOutflow = (expenses._sum.amount ?? 0) + (bankOut._sum.amount ?? 0);

      const openingBalance = 0; // TODO: calculate from previous period
      const closingBalance = openingBalance + totalInflow - totalOutflow;

      return {
        openingBalance,
        closingBalance,
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow,
        daily: [],
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.cashFlow error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to cashFlow');
    }
  }

  // GET /reports/member-dues?page=1&limit=10&status=active&search=karim
  // Response should include list of members with due > 0, total due amount, and pagination info
  // status can be active, inactive, pending
  // search should look into member name, phone, and shop name
  // Results should be sorted by total due amount in descending order

  async memberDues(somiteeId: number, query: MemberDuesDto) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);

      const where: any = {
        somiteeId: BigInt(somiteeId),
      };

      if (query.status) {
        where.status = query.status;
      }

      if (query.search) {
        where.OR = [
          {name: {contains: query.search}},
          {phone: {contains: query.search}},
          {shopName: {contains: query.search}},
        ];
      }

      // 🔥 Only members with due > 0
      where.totalDue = {gt: 0};

      const [members, total, dueAggregate] = await Promise.all([
        this.prisma.member.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {totalDue: 'desc'},
          select: {
            id: true,
            name: true,
            phone: true,
            shopName: true,
            totalDue: true,
            totalPaid: true,
            monthlyFee: true,
            status: true,
          },
        }),

        this.prisma.member.count({where}),

        this.prisma.member.aggregate({
          where: {
            somiteeId: BigInt(somiteeId),
            totalDue: {gt: 0},
          },
          _sum: {totalDue: true},
        }),
      ]);

      return {
        summary: {
          totalDue: dueAggregate._sum.totalDue ?? 0,
          membersWithDue: total,
        },
        data: members,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.memberDues error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to memberDues');
    }
  }

  //  GET /reports/bank-vs-cash?dateFrom=2026-01-01&dateTo=2026-12-31
  // Response should include total cash in hand, total bank balance, and breakdown of bank accounts with their balances
  // Cash in hand should be calculated from cash book entries (cashIn - cashOut)
  // Bank balance should be calculated from bank accounts and bank transactions (deposits - withdrawals)
  // Breakdown should include list of bank accounts with their name, account number, and balance
  // If date range is provided, only include transactions within that range for cash and bank calculations
  // For cash, consider cash book entries with date in the range
  // For bank, consider bank transactions with date in the range for calculating balance, but also include current balance from bank accounts
  // This report helps to understand the liquidity position of the somitee by comparing cash on hand vs bank balances
  async bankVsCash(somiteeId: number, query: BankVsCashDto) {
    try {
      const where: any = {
        somiteeId: BigInt(somiteeId),
      };

      // 🏦 Bank total
      const bankBalance = await this.prisma.bankAccount.aggregate({
        where,
        _sum: {balance: true},
      });

      // 💰 Cash calculation from CashBook
      const cash = await this.prisma.cashBookEntry.aggregate({
        where,
        _sum: {
          cashIn: true,
          cashOut: true,
        },
      });

      const totalCashIn = cash._sum.cashIn || 0;
      const totalCashOut = cash._sum.cashOut || 0;

      const cashInHand = totalCashIn - totalCashOut;

      // 🏦 Bank accounts list
      const bankAccounts = await this.prisma.bankAccount.findMany({
        where,
        select: {
          id: true,
          bankName: true,
          accountName: true,
          accountNumber: true,
          balance: true,
        },
      });

      const totalBankBalance = bankBalance._sum.balance || 0;

      return {
        cashInHand,
        totalBankBalance,
        totalAssets: cashInHand + totalBankBalance,
        breakdown: {
          cash: {
            totalIn: totalCashIn,
            totalOut: totalCashOut,
            netCash: cashInHand,
          },
          bank: bankAccounts,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.bankVsCash error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to bankVsCash');
    }
  }

  // GET /reports/collection?dateFrom=2026-01-01&dateTo=2026-12-31&status=approved&method=cash&memberId=1&page=1&limit=10
  // Response should include list of payments matching the filters, total collected amount, and breakdown by payment method and category
  // Filters:
  // - dateFrom and dateTo: filter payments by paymentDate
  // - status: filter by payment status (approved, pending, rejected)
  // - method: filter by payment method (cash, bank, mobile)
  // - memberId: filter payments made by a specific member
  // Pagination:
  // - page and limit for paginating results
  // Breakdown:
  // - by payment method: total amount collected for each method
  // - by category: total amount collected for each financial year (from PaymentItem)
  async collection(somiteeId: number, query: CollectionReportDto) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);

      const where: any = {
        somiteeId: BigInt(somiteeId),
      };

      // 📅 Date filter
      if (query.dateFrom || query.dateTo) {
        where.paymentDate = {};
        if (query.dateFrom) where.paymentDate.gte = new Date(query.dateFrom);
        if (query.dateTo) where.paymentDate.lte = new Date(query.dateTo);
      }

      // 🔘 filters
      if (query.status) where.status = query.status;
      if (query.method) where.method = query.method;
      if (query.memberId) where.memberId = BigInt(query.memberId);

      // 💰 main collection data
      const [payments, total, aggregate] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {paymentDate: 'desc'},
          include: {
            member: {
              select: {
                id: true,
                name: true,
                shopName: true,
              },
            },
            paymentItems: true,
          },
        }),

        this.prisma.payment.count({where}),

        this.prisma.payment.aggregate({
          where,
          _sum: {
            amount: true,
          },
        }),
      ]);

      // 📊 Method-wise breakdown
      const methodBreakdown = await this.prisma.payment.groupBy({
        by: ['method'],
        where,
        _sum: {
          amount: true,
        },
      });

      // 📊 Category breakdown (from PaymentItem)
      const categoryBreakdown = await this.prisma.paymentItem.groupBy({
        by: ['financialYear'],
        where: {
          somiteeId: BigInt(somiteeId),
        },
        _sum: {
          amount: true,
        },
      });

      const totalCollected = aggregate._sum.amount || 0;

      return {
        summary: {
          totalCollected,
          totalRecords: total,
        },
        breakdown: {
          byMethod: methodBreakdown.map((m) => ({
            method: m.method,
            amount: m._sum.amount || 0,
          })),
          byCategory: categoryBreakdown.map((c) => ({
            category: c.financialYear,
            amount: c._sum.amount || 0,
          })),
        },
        data: payments,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('reports.collection error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to collection report');
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
