import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {RedisCacheService} from '../cache/redis-cache.service';
import {ListPaymentDto} from './dto/list-payment.dto';
import {VerifyPaymentDto} from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RedisCacheService,
  ) {}

  // List payments with pagination and optional filters
  // Example: GET /payments?page=1&limit=10&status=completed&method=credit_card&memberId=123
  // Response: { data: Payment[], meta: { page: number, limit: number, total: number, totalPages: number } }
  // Handles errors and logs them appropriately

  async list(somiteeId: number, query: ListPaymentDto) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);

      const where: any = {somiteeId};

      if (query.status) where.status = query.status;
      if (query.method) where.method = query.method;
      if (query.memberId) where.memberId = Number(query.memberId);

      const [data, total] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          include: {
            member: true,
            paymentItems: true, // ✅ IMPORTANT FIX
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {paymentDate: 'desc'},
        }),
        this.prisma.payment.count({where}),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('payments.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to list payments');
    }
  }

  // Verify payment (approve or reject)
  // Example: PATCH /payments/123/verify with body { "status": "approved", "note": "Verified by admin" }
  // Response: Updated payment object
  // Handles errors and logs them appropriately
  // Important: Clears relevant cache after verification to ensure data consistency
  async verify(id: number, somiteeId: number, body: VerifyPaymentDto) {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: {id, somiteeId},
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      const cacheKey = this.cacheService.key(somiteeId, 'payments');
      await this.cacheService.del(cacheKey);

      return this.prisma.payment.update({
        where: {id},
        data: {
          status: body.status,
          note: body.note,
          verifiedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('payments.verify error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
          body,
        });
      }

      throw new InternalServerErrorException('Failed to verify payment');
    }
  }
}
