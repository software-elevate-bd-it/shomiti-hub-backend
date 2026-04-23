import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: any) {
    try {
      const where: any = {};
      if (query.category) where.category = query.category;
      if (query.search)
        where.OR = [{question: {contains: query.search}}, {answer: {contains: query.search}}];
      return this.prisma.faq.findMany({where});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('faq.service.service.list error:', {
          message: error.message,
          stack: error.stack,
          query: query,
        });
      } else {
        console.error('faq.service.service.list unknown error:', error);
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

  async create(body: any) {
    try {
      return this.prisma.faq.create({data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('faq.service.service.create error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('faq.service.service.create unknown error:', error);
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

  async update(id: number | number, body: any) {
    const faqId = Number(id);

    try {
      await this.findOne(faqId);
      return this.prisma.faq.update({where: {id: faqId}, data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('faq.service.service.update error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          body: body,
        });
      } else {
        console.error('faq.service.service.update unknown error:', error);
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

  async remove(id: number | number) {
    const faqId = Number(id);

    try {
      await this.findOne(faqId);
      await this.prisma.faq.delete({where: {id: faqId}});
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('faq.service.service.remove error:', {
          message: error.message,
          stack: error.stack,
          id: id,
        });
      } else {
        console.error('faq.service.service.remove unknown error:', error);
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

  private async findOne(id: number | number) {
    const faqId = Number(id);
    const faq = await this.prisma.faq.findUnique({where: {id: faqId}});
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }
}
