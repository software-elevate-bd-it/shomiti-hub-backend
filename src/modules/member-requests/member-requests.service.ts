import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MemberRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(somiteeId: string, page = 1, limit = 10) {
    const where = { somiteeId };
    const [data, total] = await Promise.all([
      this.prisma.memberRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.memberRequest.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async approve(id: string, somiteeId: string, body: any) {
    const request = await this.prisma.memberRequest.findFirst({ where: { id, somiteeId } });
    if (!request) {
      throw new NotFoundException('Member request not found');
    }
    const member = await this.prisma.member.create({
      data: {
        name: request.name,
        shopName: request.shopName,
        phone: request.mobile,
        address: request.address,
        nid: request.nid,
        monthlyFee: body.monthlyFee || request.monthlyFee,
        billingCycle: body.billingCycle || 'monthly',
        somiteeId: request.somiteeId,
        userId: request.userId
      }
    });
    await this.prisma.memberRequest.update({
      where: { id },
      data: { status: 'approved', approvedAt: new Date(), approvedBy: body.approvedBy || null }
    });
    return { requestId: request.id, memberId: member.id, status: 'approved', approvedAt: new Date() };
  }

  async reject(id: string, somiteeId: string, body: any) {
    const request = await this.prisma.memberRequest.findFirst({ where: { id, somiteeId } });
    if (!request) {
      throw new NotFoundException('Member request not found');
    }
    await this.prisma.memberRequest.update({
      where: { id },
      data: { status: 'rejected', rejectionNote: body.rejectionNote, rejectedAt: new Date() }
    });
    return { requestId: request.id, status: 'rejected', rejectionNote: body.rejectionNote, rejectedAt: new Date() };
  }

  async remove(id: string, somiteeId: string) {
    const request = await this.prisma.memberRequest.findFirst({ where: { id, somiteeId } });
    if (!request) {
      throw new NotFoundException('Member request not found');
    }
    await this.prisma.memberRequest.delete({ where: { id } });
    return null;
  }
}
