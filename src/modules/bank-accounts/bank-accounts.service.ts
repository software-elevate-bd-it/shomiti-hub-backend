import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ListBankAccountDto} from './dto/list-bank-account.dto';
import {BankTransactionDto} from './dto/bank-transaction.dto';
import {TransferDto} from './dto/transfer.dto';
import {CreateBankAccountDto} from './dto/create-bank-account.dto';
import {UpdateBankAccountDto} from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: ListBankAccountDto) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);

      const where: any = {
        somiteeId: BigInt(somiteeId),
      };

      if (query.search) {
        where.OR = [
          {bankName: {contains: query.search}},
          {accountName: {contains: query.search}},
          {accountNumber: {contains: query.search}},
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.bankAccount.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {createdAt: 'desc'},
        }),
        this.prisma.bankAccount.count({where}),
      ]);

      return {
        success: true,
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('bank.list error', error);
      throw new InternalServerErrorException('Failed to list bank accounts');
    }
  }

  async create(somiteeId: number, userId: number, body: CreateBankAccountDto) {
    try {
      const openingBalance = body.openingBalance ?? body.balance ?? 0;

      return await this.prisma.bankAccount.create({
        data: {
          bankName: body.bankName,
          accountName: body.accountName,
          accountNumber: body.accountNumber,

          // IMPORTANT FIX
          openingBalance: openingBalance,
          balance: openingBalance,

          somiteeId: BigInt(somiteeId),
          createdById: BigInt(userId),
        },
      });
    } catch (error) {
      console.error('bank.create error', error);
      throw new InternalServerErrorException('Failed to create bank account');
    }
  }

  // Update Bank Account
  // Only bankName, accountName, accountNumber can be updated
  // ⚠️ never freely update balance in accounting system
  // for balance correction, use deposit/withdraw with proper note
  async update(id: number, somiteeId: number, body: UpdateBankAccountDto) {
    try {
      const account = await this.findOne(id, somiteeId);

      // ❌ Prevent dangerous updates
      if ((body as any).balance !== undefined) {
        throw new BadRequestException('Balance cannot be updated directly');
      }

      // Optional: prevent changing opening balance after transactions exist
      if (body.openingBalance !== undefined) {
        const hasTransactions = await this.prisma.bankTransaction.count({
          where: {bankAccountId: account.id},
        });

        if (hasTransactions > 0) {
          throw new BadRequestException('Cannot change opening balance after transactions exist');
        }
      }

      return await this.prisma.bankAccount.update({
        where: {id},
        data: {
          bankName: body.bankName,
          accountName: body.accountName,
          accountNumber: body.accountNumber,
          openingBalance: body.openingBalance,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('bank-accounts.service.service.update error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
          body,
        });
      } else {
        console.error('bank-accounts.service.service.update unknown error:', error);
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to update');
    }
  }

  //  Delete Bank Account
  //  ⚠️ This will delete all transactions and ledger entries related to this account. Use with caution.
  //  Only allow if no transactions exist or implement a soft delete instead.
  //  For balance correction, use deposit/withdraw with proper note instead of deleting transactions.
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

  //  Deposit to Bank Account
  //  This will create a bank transaction, update bank balance, and create a ledger entry (and optional cashbook entry if from cash)
  //  For balance correction, use deposit/withdraw with proper note instead of directly updating balance
  //  Withdraw from Bank Account
  //  This will create a bank transaction, update bank balance, and create a ledger entry (and optional cashbook entry if to cash)
  //  For balance correction, use deposit/withdraw with proper note instead of directly updating balance
  async deposit(id: number, somiteeId: number, userId: number, body: BankTransactionDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const account = await this.findOne(id, somiteeId);

        const amount = Number(body.amount);

        if (amount <= 0) {
          throw new BadRequestException('Amount must be greater than 0');
        }

        const newBalance = Number(account.balance) + amount;

        const date = body.date ? new Date(body.date) : new Date();

        // 1. BANK TRANSACTION
        const bankTx = await tx.bankTransaction.create({
          data: {
            bankAccountId: account.id,
            type: 'deposit',
            amount,
            date,
            note: body.note,
            reference: body.reference,
            balanceAfter: newBalance,
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 2. UPDATE BANK ACCOUNT BALANCE
        await tx.bankAccount.update({
          where: {id: account.id},
          data: {balance: newBalance},
        });

        // 3. LEDGER ENTRY (Credit)
        await tx.ledgerEntry.create({
          data: {
            date,
            description: `Bank Deposit (${account.accountName})`,
            type: 'bank_deposit',
            debit: null,
            credit: amount,
            balance: newBalance,
            referenceType: 'bank_transaction',
            referenceId: bankTx.id.toString(),
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 4. OPTIONAL: CASHBOOK (if deposit from cash)
        await tx.cashBookEntry.create({
          data: {
            date,
            description: `Cash deposited to bank`,
            cashIn: 0,
            cashOut: amount,
            balance: 0, // you can calculate running balance if needed
            referenceType: 'bank_transaction',
            referenceId: bankTx.id.toString(),
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 4. TRANSACTION TABLE (GLOBAL RECORD)
        await tx.transaction.create({
          data: {
            memberId: null,
            memberName: null,
            type: 'deposit',
            amount,
            date,
            status: 'approved',
            method: 'bank',
            category: 'Bank Deposit',
            transactionId: bankTx.id.toString(),
            note: body.note,
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        return {
          success: true,
          message: 'Deposit successful',
          data: bankTx,
        };
      });
    } catch (error) {
      console.error('bank.deposit error', error);

      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Failed to deposit');
    }
  }

  // Withdraw from Bank Account
  // This will create a bank transaction, update bank balance, and create a ledger entry (and optional cashbook entry if to cash)
  // For balance correction, use deposit/withdraw with proper note instead of directly updating balance
  // This will check for sufficient balance before allowing withdraw to prevent negative balance
  // This is a critical operation that can affect financial integrity, so proper validation and error handling is implemented
  // This will also log detailed error information for debugging in case of failure
  async withdraw(id: number, somiteeId: number, userId: number, body: BankTransactionDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const account = await this.findOne(id, somiteeId);

        const amount = Number(body.amount);

        if (amount <= 0) {
          throw new BadRequestException('Amount must be greater than 0');
        }

        // ❗ CRITICAL CHECK
        if (Number(account.balance) < amount) {
          throw new BadRequestException('Insufficient bank balance');
        }

        const newBalance = Number(account.balance) - amount;
        const date = body.date ? new Date(body.date) : new Date();

        // 1. BANK TRANSACTION
        const bankTx = await tx.bankTransaction.create({
          data: {
            bankAccountId: account.id,
            type: 'withdraw',
            amount,
            date,
            note: body.note,
            reference: body.reference,
            balanceAfter: newBalance,
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 2. UPDATE BANK BALANCE
        await tx.bankAccount.update({
          where: {id: account.id},
          data: {balance: newBalance},
        });

        // 3. LEDGER ENTRY (Debit)
        await tx.ledgerEntry.create({
          data: {
            date,
            description: `Bank Withdraw (${account.accountName})`,
            type: 'bank_withdraw',
            debit: amount,
            credit: null,
            balance: newBalance,
            referenceType: 'bank_transaction',
            referenceId: bankTx.id.toString(),
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 4. CASHBOOK (Cash increases)
        await tx.cashBookEntry.create({
          data: {
            date,
            description: `Cash received from bank`,
            cashIn: amount,
            cashOut: 0,
            balance: 0, // optional running balance
            referenceType: 'bank_transaction',
            referenceId: bankTx.id.toString(),
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        await tx.transaction.create({
          data: {
            memberId: null, // no member involved
            memberName: null,
            type: 'withdraw',
            amount,
            date,
            status: 'approved',
            method: 'bank',
            category: 'Bank Withdraw',
            transactionId: bankTx.id.toString(),
            note: body.note,
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        return {
          success: true,
          message: 'Withdraw successful',
          data: bankTx,
        };
      });
    } catch (error) {
      console.error('bank.withdraw error', error);

      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Failed to withdraw');
    }
  }

  // Transfer between Bank Accounts
  // This will create two bank transactions (withdraw from source and deposit to destination), update both account balances, and create ledger entries for both
  // This will check for sufficient balance in source account before allowing transfer to prevent negative balance
  // This is a critical operation that can affect financial integrity, so proper validation and error handling is implemented
  // This will also log detailed error information for debugging in case of failure
  async transfer(id: number, somiteeId: number, userId: number, body: TransferDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const from = await this.findOne(id, somiteeId);
        const to = await this.findOne(body.toAccountId, somiteeId);

        if (from.id === to.id) {
          throw new BadRequestException('Cannot transfer to same account');
        }

        const amount = Number(body.amount);

        if (amount <= 0) {
          throw new BadRequestException('Amount must be greater than 0');
        }

        // ❗ CRITICAL CHECK
        if (Number(from.balance) < amount) {
          throw new BadRequestException('Insufficient balance');
        }

        const date = body.date ? new Date(body.date) : new Date();

        const fromBalance = Number(from.balance) - amount;
        const toBalance = Number(to.balance) + amount;

        // 1. FROM TRANSACTION (OUT)
        const fromTx = await tx.bankTransaction.create({
          data: {
            bankAccountId: from.id,
            type: 'transfer_out',
            amount,
            date,
            note: body.note,
            reference: body.reference,
            balanceAfter: fromBalance,
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 2. TO TRANSACTION (IN)
        const toTx = await tx.bankTransaction.create({
          data: {
            bankAccountId: to.id,
            type: 'transfer_in',
            amount,
            date,
            note: body.note,
            reference: body.reference,
            balanceAfter: toBalance,
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 3. UPDATE BOTH ACCOUNTS
        await tx.bankAccount.update({
          where: {id: from.id},
          data: {balance: fromBalance},
        });

        await tx.bankAccount.update({
          where: {id: to.id},
          data: {balance: toBalance},
        });

        // 4. LEDGER ENTRY (OUT)
        await tx.ledgerEntry.create({
          data: {
            date,
            description: `Transfer to ${to.accountName}`,
            type: 'bank_transfer_out',
            debit: amount,
            credit: null,
            balance: fromBalance,
            referenceType: 'bank_transaction',
            referenceId: fromTx.id.toString(),
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        // 5. LEDGER ENTRY (IN)
        await tx.ledgerEntry.create({
          data: {
            date,
            description: `Transfer from ${from.accountName}`,
            type: 'bank_transfer_in',
            debit: null,
            credit: amount,
            balance: toBalance,
            referenceType: 'bank_transaction',
            referenceId: toTx.id.toString(),
            somiteeId: BigInt(somiteeId),
            createdById: BigInt(userId),
          },
        });

        return {
          success: true,
          message: 'Transfer successful',
          data: {
            fromTx,
            toTx,
          },
        };
      });
    } catch (error) {
      console.error('bank.transfer error', error);

      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw error;

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
    const account = await this.prisma.bankAccount.findFirst({
      where: {
        id: BigInt(id),
        somiteeId: BigInt(somiteeId),
      },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return account;
  }
}
