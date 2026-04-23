import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: any) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const where: any = {somiteeId};
      const [data, total] = await Promise.all([
        this.prisma.bankAccount.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {createdAt: 'desc'},
        }),
        this.prisma.bankAccount.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('bank-accounts.service.service.list unknown error:', error);
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

  async create(somiteeId: number, userId: number, body: any) {
    try {
      return this.prisma.bankAccount.create({data: {...body, somiteeId, userId}});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.create error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          userId: userId,
          body: body,
        });
      } else {
        console.error('bank-accounts.service.service.create unknown error:', error);
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
      return this.prisma.bankAccount.update({where: {id}, data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.update error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('bank-accounts.service.service.update unknown error:', error);
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
      await this.prisma.bankAccount.delete({where: {id}});
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.remove error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('bank-accounts.service.service.remove unknown error:', error);
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

  async deposit(id: number, somiteeId: number, body: any) {
    try {
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
          createdById: body.userId || account.createdById,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.deposit error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('bank-accounts.service.service.deposit unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to deposit');
    }
  }

  async withdraw(id: number, somiteeId: number, body: any) {
    try {
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
          createdById: body.userId || account.createdById,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.withdraw error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('bank-accounts.service.service.withdraw unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to withdraw');
    }
  }

  async transfer(id: number, somiteeId: number, body: any) {
    try {
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
          createdById: body.userId || fromAccount.createdById,
        },
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
          createdById: body.userId || toAccount.createdById,
        },
      });
      return {fromTransaction: fromTx, toTransaction: toTx};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.transfer error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('bank-accounts.service.service.transfer unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to transfer');
    }
  }

  async transactions(id: number, somiteeId: number, query: any) {
    try {
      await this.findOne(id, somiteeId);
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);
      const where: any = {bankAccountId: id, somiteeId};
      if (query.type) where.type = query.type;
      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }
      const [data, total] = await Promise.all([
        this.prisma.bankTransaction.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},
        }),
        this.prisma.bankTransaction.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.transactions error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('bank-accounts.service.service.transactions unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to transactions');
    }
  }

  async statement(id: number, query: any) {
    try {
      return {
        generated: true,
        format: query.format || 'pdf',
        bankAccountId: id,
        from: query.dateFrom,
        to: query.dateTo,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.statement error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          query: query,
        });
      } else {
        console.error('bank-accounts.service.service.statement unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to statement');
    }
  }

  private async findOne(id: number, somiteeId: number) {
    const account = await this.prisma.bankAccount.findFirst({where: {id, somiteeId}});
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    return account;
  }
}
