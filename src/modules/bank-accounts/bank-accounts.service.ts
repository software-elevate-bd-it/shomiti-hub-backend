import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, query: any) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: any = { somiteeId };
    const [data, total] = await Promise.all([
      this.prisma.bankAccount.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.bankAccount.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(somiteeId: string, body: any) {
    return this.prisma.bankAccount.create({ data: { ...body, somiteeId } });
  }

  async update(id: string, somiteeId: string, body: any) {
    await this.findOne(id, somiteeId);
    return this.prisma.bankAccount.update({ where: { id }, data: body });
  }

  async remove(id: string, somiteeId: string) {
    await this.findOne(id, somiteeId);
    await this.prisma.bankAccount.delete({ where: { id } });
    return null;
  }

  async deposit(id: string, somiteeId: string, body: any) {
    const account = await this.findOne(id, somiteeId);
    return this.prisma.bankTransaction.create({
      data: {
        bankAccountId: account.id,
        type: 'deposit',
        amount: body.amount,
        date: new Date(body.date || undefined),
        note: body.note,
        reference: body.reference,
        balanceAfter: account.balance + Number(body.amount),
        somiteeId: account.somiteeId,
        userId: body.userId || account.userId
      }
    });
  }

  async withdraw(id: string, somiteeId: string, body: any) {
    const account = await this.findOne(id, somiteeId);
    return this.prisma.bankTransaction.create({
      data: {
        bankAccountId: account.id,
        type: 'withdraw',
        amount: body.amount,
        date: new Date(body.date || undefined),
        note: body.note,
        balanceAfter: account.balance - Number(body.amount),
        somiteeId: account.somiteeId,
        userId: body.userId || account.userId
      }
    });
  }

  async transfer(id: string, somiteeId: string, body: any) {
    const fromAccount = await this.findOne(id, somiteeId);
    const toAccount = await this.findOne(body.toAccountId, somiteeId);
    const fromTx = await this.prisma.bankTransaction.create({
      data: {
        bankAccountId: fromAccount.id,
        type: 'transfer',
        amount: body.amount,
        date: new Date(body.date || undefined),
        note: body.note,
        balanceAfter: fromAccount.balance - Number(body.amount),
        somiteeId: somiteeId,
        userId: body.userId || fromAccount.userId
      }
    });
    const toTx = await this.prisma.bankTransaction.create({
      data: {
        bankAccountId: toAccount.id,
        type: 'deposit',
        amount: body.amount,
        date: new Date(body.date || undefined),
        note: body.note,
        balanceAfter: toAccount.balance + Number(body.amount),
        somiteeId: somiteeId,
        userId: body.userId || toAccount.userId
      }
    });
    return { fromTransaction: fromTx, toTransaction: toTx };
  }

  async transactions(id: string, somiteeId: string, query: any) {
    await this.findOne(id, somiteeId);
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const where: any = { bankAccountId: id, somiteeId };
    if (query.type) where.type = query.type;
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    const [data, total] = await Promise.all([
      this.prisma.bankTransaction.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.bankTransaction.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async statement(id: string, query: any) {
    return { generated: true, format: query.format || 'pdf', bankAccountId: id, from: query.dateFrom, to: query.dateTo };
  }

  private async findOne(id: string, somiteeId: string) {
    const account = await this.prisma.bankAccount.findFirst({ where: { id, somiteeId } });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    return account;
  }
}
