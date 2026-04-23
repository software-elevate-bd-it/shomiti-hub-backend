import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: any) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const where: any = {somiteeId};
      if (query.category) where.category = query.category;
      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }
      if (query.amountMin || query.amountMax) {
        where.amount = {};
        if (query.amountMin) where.amount.gte = Number(query.amountMin);
        if (query.amountMax) where.amount.lte = Number(query.amountMax);
      }
      const [data, total] = await Promise.all([
        this.prisma.expense.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},
        }),
        this.prisma.expense.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('expenses.service.service.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('expenses.service.service.list unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to list');
    }
  }

  async create(somiteeId: number, body: any) {
    try {
      return this.prisma.expense.create({data: {...body, somiteeId}});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('expenses.service.service.create error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('expenses.service.service.create unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create');
    }
  }

  async update(id: number, somiteeId: number, body: any) {
    try {
      await this.findOne(id, somiteeId);
      return this.prisma.expense.update({where: {id}, data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('expenses.service.service.update error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('expenses.service.service.update unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update');
    }
  }

  async remove(id: number, somiteeId: number) {
    try {
      await this.findOne(id, somiteeId);
      await this.prisma.expense.delete({where: {id}});
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('expenses.service.service.remove error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('expenses.service.service.remove unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove');
    }
  }

  async categories() {
    try {
      return [
        'Maintenance',
        'Electricity',
        'Water',
        'Security',
        'Cleaning',
        'Repair',
        'Office Supplies',
        'Transport',
        'Other',
      ];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('expenses.service.service.categories error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('expenses.service.service.categories unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to categories');
    }
  }

  private async findOne(id: number, somiteeId: number) {
    const expense = await this.prisma.expense.findFirst({where: {id, somiteeId}});
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }
}
