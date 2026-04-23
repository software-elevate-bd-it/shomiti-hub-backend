import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../../prisma/prisma.service';

@Injectable()
export class SomiteesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: any) {
    try {
      const page = Number(query.page || 1);
      const limit = Number(query.limit || 10);
      const where: any = {};
      if (query.search) where.name = {contains: query.search};
      if (query.status) where.status = query.status;
      if (query.plan) where.plan = query.plan;

      const [data, total] = await Promise.all([
        this.prisma.somitee.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {createdAt: 'desc'},
        }),
        this.prisma.somitee.count({where}),
      ]);

      return {data, meta: {page, limit, total, totalPages: Math.ceil(total / limit)}};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('somitees.service.list error:', {
          message: error.message,
          stack: error.stack,
          query,
        });
      } else {
        console.error('somitees.service.list unknown error:', error);
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

  async findOne(id: number) {
    try {
      const somitee = await this.prisma.somitee.findUnique({where: {id}});
      if (!somitee) {
        throw new NotFoundException('Somitee not found');
      }
      return somitee;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('somitees.service.findOne error:', {
          message: error.message,
          stack: error.stack,
          id,
        });
      } else {
        console.error('somitees.service.findOne unknown error:', error);
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

  async create(body: any) {
    try {
      return this.prisma.somitee.create({data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('somitees.service.create error:', {
          message: error.message,
          stack: error.stack,
          body,
        });
      } else {
        console.error('somitees.service.create unknown error:', error);
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

  async update(id: number, body: any) {
    try {
      await this.findOne(id);
      return this.prisma.somitee.update({where: {id}, data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('somitees.service.update error:', {
          message: error.message,
          stack: error.stack,
          id,
          body,
        });
      } else {
        console.error('somitees.service.update unknown error:', error);
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

  async changeStatus(id: number, body: any) {
    try {
      await this.findOne(id);
      return this.prisma.somitee.update({
        where: {id},
        data: {status: body.status, blockedReason: body.reason},
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('somitees.service.changeStatus error:', {
          message: error.message,
          stack: error.stack,
          id,
          body,
        });
      } else {
        console.error('somitees.service.changeStatus unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to changeStatus');
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.prisma.somitee.delete({where: {id}});
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('somitees.service.remove error:', {
          message: error.message,
          stack: error.stack,
          id,
        });
      } else {
        console.error('somitees.service.remove unknown error:', error);
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
}
