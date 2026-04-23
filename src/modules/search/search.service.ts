import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(somiteeId: number, query: any) {
    try {
      const q = query.q || '';
      const filter = {
        somiteeId,
        OR: [{name: {contains: q}}, {shopName: {contains: q}}, {phone: {contains: q}}],
      };
      return {
        members: await this.prisma.member.findMany({where: filter}),
        transactions: await this.prisma.transaction.findMany({
          where: {somiteeId, transactionId: {contains: q}},
        }),
        bankAccounts: await this.prisma.bankAccount.findMany({
          where: {somiteeId, accountName: {contains: q}},
        }),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('search.service.service.search error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('search.service.service.search unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to search');
    }
  }
}
