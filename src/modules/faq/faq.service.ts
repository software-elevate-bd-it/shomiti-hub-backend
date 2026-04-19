import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: any) {
    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.search) where.OR = [{ question: { contains: query.search } }, { answer: { contains: query.search } }];
    return this.prisma.faq.findMany({ where });
  }

  async create(body: any) {
    return this.prisma.faq.create({ data: body });
  }

  async update(id: string, body: any) {
    await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data: body });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.faq.delete({ where: { id } });
    return null;
  }

  private async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }
    return faq;
  }
}
