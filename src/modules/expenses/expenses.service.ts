import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: any = { somiteeId };
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
      this.prisma.expense.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.expense.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(somiteeId: string, body: any) {
    return this.prisma.expense.create({ data: { ...body, somiteeId } });
  }

  async update(id: string, somiteeId: string, body: any) {
    await this.findOne(id, somiteeId);
    return this.prisma.expense.update({ where: { id }, data: body });
  }

  async remove(id: string, somiteeId: string) {
    await this.findOne(id, somiteeId);
    await this.prisma.expense.delete({ where: { id } });
    return null;
  }

  async categories() {
    return [
      'Maintenance',
      'Electricity',
      'Water',
      'Security',
      'Cleaning',
      'Repair',
      'Office Supplies',
      'Transport',
      'Other'
    ];
  }

  private async findOne(id: string, somiteeId: string) {
    const expense = await this.prisma.expense.findFirst({ where: { id, somiteeId } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }
}
