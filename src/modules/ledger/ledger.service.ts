import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ListLedgerQueryDto} from './dto/list-ledger-query.dto';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: ListLedgerQueryDto) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);

      const where: any = {
        somiteeId: BigInt(somiteeId),
      };

      // ======================
      // SEARCH
      // ======================
      if (query.search) {
        where.OR = [
          {memberName: {contains: query.search}},
          {description: {contains: query.search}},
          {referenceId: {contains: query.search}},
        ];
      }

      // ======================
      // FILTERS
      // ======================
      if (query.type) where.type = query.type;

      if (query.memberId) {
        where.memberId = BigInt(query.memberId);
      }

      // ======================
      // DATE FILTER
      // ======================
      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }

      // ======================
      // QUERY
      // ======================
      const [data, total] = await Promise.all([
        this.prisma.ledgerEntry.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},

          // 🔥 ADD RELATIONS
          include: {
            member: {
              select: {
                id: true,
                name: true,
                shopName: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),

        this.prisma.ledgerEntry.count({where}),
      ]);

      // ======================
      // ENRICH DATA (SMART NAME LOGIC)
      // ======================
      const formatted = data.map((item) => {
        let memberName = 'Unknown';
        let sourceLabel = '';

        if (item.member?.name) {
          memberName = item.member.name;
          sourceLabel = 'Member';
        } else if (item.memberName) {
          memberName = item.memberName;
          sourceLabel = 'Member';
        } else if (item.createdBy?.name) {
          memberName = item.createdBy.name;
          sourceLabel = 'System User';
        }

        return {
          ...item,
          memberName: sourceLabel ? `${memberName} (${sourceLabel})` : memberName,
        };
      });

      return {
        success: true,
        data: formatted,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      console.error('ledger.list error:', {
        message: error instanceof Error ? error.message : error,
        somiteeId,
        query,
      });

      throw new InternalServerErrorException('Failed to list ledger');
    }
  }
  // ====================== SUMMARY ======================
  async summary(somiteeId: number, query: ListLedgerQueryDto) {
    try {
      const where: any = {somiteeId};

      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }

      const [income, expense, openingBalance] = await Promise.all([
        this.prisma.ledgerEntry.aggregate({
          where: {...where, type: 'collection'},
          _sum: {credit: true},
        }),
        this.prisma.ledgerEntry.aggregate({
          where: {...where, type: 'expense'},
          _sum: {debit: true},
        }),
        this.prisma.ledgerEntry.findFirst({
          where,
          orderBy: {date: 'asc'},
        }),
      ]);

      const totalIncome = income._sum.credit || 0;
      const totalExpense = expense._sum.debit || 0;

      return {
        success: true,
        data: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          openingBalance: openingBalance?.balance || 0,
          closingBalance: (openingBalance?.balance || 0) + (totalIncome - totalExpense),
        },
        period: {
          from: query.dateFrom || null,
          to: query.dateTo || null,
        },
      };
    } catch (error) {
      console.error('ledger.summary error:', error);
      throw new InternalServerErrorException('Failed to summary ledger');
    }
  }
}
