import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(somiteeId: string, query: any) {
    const q = query.q || '';
    const filter = {
      somiteeId,
      OR: [
        { name: { contains: q } },
        { shopName: { contains: q } },
        { phone: { contains: q } }
      ]
    };
    return {
      members: await this.prisma.member.findMany({ where: filter }),
      transactions: await this.prisma.transaction.findMany({ where: { somiteeId, transactionId: { contains: q } } }),
      bankAccounts: await this.prisma.bankAccount.findMany({ where: { somiteeId, accountName: { contains: q } } })
    };
  }
}
