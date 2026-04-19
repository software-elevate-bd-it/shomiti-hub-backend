import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberQueryDto } from './dto/member-query.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, query: MemberQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const where: any = { somiteeId };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { phone: { contains: query.search } },
        { shopName: { contains: query.search } }
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
        orderBy: { name: query.sortOrder === 'desc' ? 'desc' : 'asc' }
      }),
      this.prisma.member.count({ where })
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, somiteeId: string) {
    const member = await this.prisma.member.findFirst({ where: { id, somiteeId } });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async create(somiteeId: string, userId: string, dto: CreateMemberDto) {
    return this.prisma.member.create({
      data: {
        ...dto,
        somiteeId,
        userId,
        status: 'active'
      }
    });
  }

  async update(id: string, somiteeId: string, dto: UpdateMemberDto) {
    await this.findOne(id, somiteeId);
    return this.prisma.member.update({
      where: { id },
      data: dto
    });
  }

  async remove(id: string, somiteeId: string) {
    await this.findOne(id, somiteeId);
    return this.prisma.member.delete({ where: { id } });
  }

  async ledger(id: string, somiteeId: string, query: any) {
    await this.findOne(id, somiteeId);
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const where: any = { memberId: id, somiteeId };
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.type) where.type = query.type;
    const [data, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.ledgerEntry.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async paymentHistory(id: string, somiteeId: string, query: any) {
    await this.findOne(id, somiteeId);
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: any = { memberId: id, somiteeId };
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { paymentDate: 'desc' } }),
      this.prisma.payment.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async dueHistory(id: string, somiteeId: string) {
    // Tenant-specific due history can be implemented here.
    return { data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } };
  }

  async report(id: string, somiteeId: string, query: any) {
    // Tenant-specific member report generation can be implemented here.
    return { format: query.format || 'pdf', generated: true, memberId: id };
  }

  async uploadPhoto(id: string, somiteeId: string, body: any) {
    // Tenant-specific member photo upload can be implemented here.
    return { photoUrl: body.photoUrl || null };
  }
}
