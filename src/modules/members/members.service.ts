import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {CreateMemberDto} from './dto/create-member.dto';
import {UpdateMemberDto} from './dto/update-member.dto';
import {MemberQueryDto} from './dto/member-query.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: number, query: MemberQueryDto) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const where: any = {somiteeId};

      if (query.search) {
        where.OR = [
          {name: {contains: query.search}},
          {phone: {contains: query.search}},
          {shopName: {contains: query.search}},
        ];
      }
      if (query.status) {
        where.status = query.status;
      }

      const [data, total] = await Promise.all([
        this.prisma.member.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {name: query.sortOrder === 'desc' ? 'desc' : 'asc'},
        }),
        this.prisma.member.count({where}),
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
        console.error('members.service.service.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('members.service.service.list unknown error:', error);
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

  async findOneOld(id: number, somiteeId: number) {
    try {
      const member = await this.prisma.member.findFirst({where: {id, somiteeId}});
      if (!member) {
        throw new NotFoundException('Member not found');
      }
      return member;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.findOne error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('members.service.service.findOne unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to findOne');
    }
  }

  async findOne(id: number, somiteeId: number) {
    try {
      const member = await this.prisma.member.findFirst({
        where: {
          id,
          somiteeId,
        },

        include: {
          // registration/request info
          request: true,

          // payment history
          payments: {
            orderBy: {
              paymentDate: 'desc',
            },
            include: {
              paymentItems: true,
            },
          },

          // ledger
          ledgerEntries: {
            orderBy: {
              createdAt: 'desc',
            },
          },

          // transactions
          transactions: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      // stats
      const totalPaid = member.payments.reduce((sum, item) => sum + item.amount, 0);

      const paymentCount = member.payments.length;

      const totalDue = member.totalDue;

      const dueAmount = totalDue - totalPaid;

      const lastPayment = member.payments.length > 0 ? member.payments[0] : null;

      return {
        ...member,

        stats: {
          paymentCount,
          totalPaid,
          totalDue,
          dueAmount,
          monthlyFee: member.monthlyFee,
          lastPayment,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.findOne error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
        });
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to find member');
    }
  }

  async create(somiteeId: number, userId: number, dto: CreateMemberDto) {
    try {
      return this.prisma.member.create({
        data: {
          ...dto,
          somiteeId,
          createdById: userId,
          status: 'active',
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.create error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          userId: userId,
          dto: dto,
        });
      } else {
        console.error('members.service.service.create unknown error:', error);
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

  async update(id: number, somiteeId: number, dto: UpdateMemberDto) {
    try {
      await this.findOne(id, somiteeId);
      return this.prisma.member.update({
        where: {id},
        data: dto,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.update error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          dto: dto,
        });
      } else {
        console.error('members.service.service.update unknown error:', error);
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
      return this.prisma.member.delete({where: {id}});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.remove error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('members.service.service.remove unknown error:', error);
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

  async ledger(id: number, somiteeId: number, query: any) {
    try {
      await this.findOne(id, somiteeId);
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);
      const where: any = {memberId: id, somiteeId};
      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
        if (query.dateTo) where.date.lte = new Date(query.dateTo);
      }
      if (query.type) where.type = query.type;
      const [data, total] = await Promise.all([
        this.prisma.ledgerEntry.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {date: 'desc'},
        }),
        this.prisma.ledgerEntry.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.ledger error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('members.service.service.ledger unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to ledger');
    }
  }

  async paymentHistory(id: number, somiteeId: number, query: any) {
    try {
      await this.findOne(id, somiteeId);
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const where: any = {memberId: id, somiteeId};
      const [data, total] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {paymentDate: 'desc'},
        }),
        this.prisma.payment.count({where}),
      ]);
      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.paymentHistory error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('members.service.service.paymentHistory unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to paymentHistory');
    }
  }

  async dueHistory(id: number, somiteeId: number) {
    try {
      // Tenant-specific due history can be implemented here.
      return {data: [], meta: {page: 1, limit: 12, total: 0, totalPages: 0}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.dueHistory error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('members.service.service.dueHistory unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to dueHistory');
    }
  }

  async report(id: number, somiteeId: number, query: any) {
    try {
      // Tenant-specific member report generation can be implemented here.
      return {format: query.format || 'pdf', generated: true, memberId: id};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.report error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('members.service.service.report unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to report');
    }
  }

  async uploadPhoto(id: number, somiteeId: number, body: any) {
    try {
      // Tenant-specific member photo upload can be implemented here.
      return {photoUrl: body.photoUrl || null};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('members.service.service.uploadPhoto error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
          body: body,
        });
      } else {
        console.error('members.service.service.uploadPhoto unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to uploadPhoto');
    }
  }

  async getMemberFullProfile(memberId: number, somiteeId: number) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        /*
      |--------------------------------------------------------------------------
      | Member + request + relations
      |--------------------------------------------------------------------------
      */
        const member = await tx.member.findFirst({
          where: {
            id: memberId,
            somiteeId,
          },
          include: {
            request: true,

            payments: {
              orderBy: {
                paymentDate: 'desc',
              },
              include: {
                paymentItems: true,
              },
            },

            transactions: {
              orderBy: {
                date: 'desc',
              },
            },

            ledgerEntries: {
              orderBy: {
                date: 'desc',
              },
            },
          },
        });

        if (!member) {
          throw new NotFoundException('Member not found');
        }

        /*
      |--------------------------------------------------------------------------
      | Payment Stats
      |--------------------------------------------------------------------------
      */
        const paymentStats = await tx.payment.aggregate({
          where: {
            memberId,
            somiteeId,
          },
          _sum: {
            amount: true,
          },
          _count: true,
        });

        /*
      |--------------------------------------------------------------------------
      | Monthly Stats
      |--------------------------------------------------------------------------
      */
        const monthlyPayments = await tx.paymentItem.groupBy({
          by: ['month', 'financialYear'],

          where: {
            memberId,
            somiteeId,
          },

          _sum: {
            amount: true,
          },

          orderBy: {
            month: 'asc',
          },
        });

        /*
      |--------------------------------------------------------------------------
      | Member Due
      |--------------------------------------------------------------------------
      */
        const dueAmount = member.totalDue - member.totalPaid;

        /*
      |--------------------------------------------------------------------------
      | Last Payment
      |--------------------------------------------------------------------------
      */
        const lastPayment = await tx.payment.findFirst({
          where: {
            memberId,
            somiteeId,
          },

          orderBy: {
            paymentDate: 'desc',
          },
        });

        /*
      |--------------------------------------------------------------------------
      | Dashboard stats
      |--------------------------------------------------------------------------
      */
        const stats = await tx.statsSummary.findMany({
          where: {
            somiteeId,
          },

          orderBy: {
            date: 'desc',
          },

          take: 12,
        });

        return {
          member,

          summary: {
            totalPaid: paymentStats._sum.amount || 0,

            paymentCount: paymentStats._count || 0,

            totalDue: member.totalDue,

            currentDue: dueAmount,

            monthlyFee: member.monthlyFee,

            billingCycle: member.billingCycle,

            lastPayment,
          },

          reports: {
            monthlyPayments,
            stats,
          },
        };
      });

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('members.service.getMemberFullProfile', error);

      throw new InternalServerErrorException('Failed to get member profile');
    }
  }
}
