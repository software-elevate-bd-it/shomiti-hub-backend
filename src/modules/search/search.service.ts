import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {SearchDto} from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: Add pagination and limit results
  // TODO: Add more search fields and related entities as needed
  // TODO: Optimize queries and consider using full-text search for larger datasets
  // TODO: Add proper error handling and logging
  // TODO: Add caching for frequently searched keywords to improve performance
  // TODO: Add unit tests and integration tests for search functionality
  // TODO: Consider security implications of search and sanitize inputs to prevent injection attacks
  async search(somiteeId: number, query: SearchDto) {
    try {
      const q = query.q?.trim() || '';

      const members = await this.prisma.member.findMany({
        where: {
          somiteeId: BigInt(somiteeId),
          OR: [{name: {contains: q}}, {shopName: {contains: q}}, {phone: {contains: q}}],
        },
      });

      const transactions = await this.prisma.transaction.findMany({
        where: {
          somiteeId: BigInt(somiteeId),
          transactionId: q ? {contains: q} : undefined,
        },
      });

      const bankAccounts = await this.prisma.bankAccount.findMany({
        where: {
          somiteeId: BigInt(somiteeId),
          accountName: q ? {contains: q} : undefined,
        },
      });

      return {
        members,
        transactions,
        bankAccounts,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('search.service error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to search');
    }
  }
}
