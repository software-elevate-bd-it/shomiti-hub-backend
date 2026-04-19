import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApprovalDto, ApproveRejectDto } from './dto/approvals.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async getApprovals(somiteeId: string, query: any = {}) {
    const { status = 'pending', type, createdBy, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { somiteeId };
    if (status !== 'all') where.status = status;
    if (type) where.type = type;
    if (createdBy) where.createdById = createdBy;

    const [approvals, total] = await Promise.all([
      this.prisma.approval.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.approval.count({ where }),
    ]);

    const counts = await this.prisma.approval.groupBy({
      by: ['status'],
      where: { somiteeId },
      _count: true,
    });

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    counts.forEach((count: any) => {
      statusCounts[count.status as keyof typeof statusCounts] = count._count;
    });

    return {
      data: approvals,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        counts: statusCounts,
      },
    };
  }

  async getApproval(id: string, somiteeId: string) {
    const approval = await this.prisma.approval.findFirst({
      where: { id, somiteeId },
      include: {
        createdBy: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });
    if (!approval) {
      throw new NotFoundException('Approval not found');
    }
    return approval;
  }

  async createApproval(dto: CreateApprovalDto, userId: string, userName: string, somiteeId: string) {
    // Check user permissions for the action type
    const permissionMap = {
      collection: 'collection.create',
      expense: 'expense.create',
      bank: 'bank.create',
      member: 'member.create',
    };

    const requiredPermission = permissionMap[dto.type as keyof typeof permissionMap];
    const hasPermission = await this.checkUserPermission(userId, requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    const approval = await this.prisma.approval.create({
      data: {
        type: dto.type,
        title: dto.title,
        amount: dto.amount,
        description: dto.description,
        payload: dto.payload,
        createdById: userId,
        createdByName: userName,
        somiteeId,
      },
    });
    return approval;
  }

  async approveApproval(id: string, dto: ApproveRejectDto, reviewerId: string, reviewerName: string, somiteeId: string) {
    const approval = await this.prisma.approval.findFirst({
      where: { id, somiteeId },
    });
    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== 'pending') {
      throw new BadRequestException('Approval is not in pending status');
    }

    // Check reviewer permissions
    const permissionMap = {
      collection: 'collection.approve',
      expense: 'expense.approve',
      bank: 'bank.approve',
      member: 'member.approve',
    };

    const requiredPermission = permissionMap[approval.type as keyof typeof permissionMap];
    const hasPermission = await this.checkUserPermission(reviewerId, requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    // Update approval
    const updatedApproval = await this.prisma.approval.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedById: reviewerId,
        reviewedByName: reviewerName,
        reviewedAt: new Date(),
      },
    });

    // Create the actual record based on type
    let createdRecordId: string | null = null;
    try {
      createdRecordId = await this.createRecordFromApproval(approval);
    } catch (error) {
      // If record creation fails, we should probably mark as rejected or handle error
      console.error('Failed to create record from approval:', error);
    }

    if (createdRecordId) {
      await this.prisma.approval.update({
        where: { id },
        data: { createdRecordId },
      });
    }

    return {
      ...updatedApproval,
      createdRecordId,
    };
  }

  async rejectApproval(id: string, dto: ApproveRejectDto, reviewerId: string, reviewerName: string, somiteeId: string) {
    if (!dto.note) {
      throw new BadRequestException('Rejection note is required');
    }

    const approval = await this.prisma.approval.findFirst({
      where: { id, somiteeId },
    });
    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== 'pending') {
      throw new BadRequestException('Approval is not in pending status');
    }

    // Check reviewer permissions
    const permissionMap = {
      collection: 'collection.approve',
      expense: 'expense.approve',
      bank: 'bank.approve',
      member: 'member.approve',
    };

    const requiredPermission = permissionMap[approval.type as keyof typeof permissionMap];
    const hasPermission = await this.checkUserPermission(reviewerId, requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    const updatedApproval = await this.prisma.approval.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedById: reviewerId,
        reviewedByName: reviewerName,
        reviewedAt: new Date(),
        rejectionNote: dto.note,
      },
    });

    return updatedApproval;
  }

  async getApprovalStats(somiteeId: string) {
    const counts = await this.prisma.approval.groupBy({
      by: ['type'],
      where: { somiteeId, status: 'pending' },
      _count: true,
    });

    const stats = {
      totalPending: 0,
      byType: {
        collection: 0,
        expense: 0,
        bank: 0,
        member: 0,
      },
    };

    counts.forEach((count: any) => {
      stats.byType[count.type as keyof typeof stats.byType] = count._count;
      stats.totalPending += count._count;
    });

    return stats;
  }

  private async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });

    if (!user) return false;

    // Super admin and main user have all permissions
    if (user.role === 'super_admin' || user.role === 'main_user') {
      return true;
    }

    // Check assigned roles
    for (const assignment of user.roleAssignments) {
      const rolePermissions = assignment.role.permissions as string[];
      if (rolePermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  private async createRecordFromApproval(approval: any): Promise<string | null> {
    const payload = approval.payload;

    switch (approval.type) {
      case 'collection':
        const collection = await this.prisma.transaction.create({
          data: {
            memberId: payload.memberId,
            type: 'collection',
            amount: approval.amount,
            date: new Date(payload.date),
            status: 'approved',
            method: payload.method,
            category: payload.category,
            transactionId: payload.transactionId,
            note: payload.note,
            somiteeId: approval.somiteeId,
            userId: approval.createdById,
          },
        });
        return collection.id;

      case 'expense':
        const expense = await this.prisma.expense.create({
          data: {
            amount: approval.amount,
            date: new Date(payload.date),
            category: payload.category,
            method: payload.method,
            note: payload.note,
            somiteeId: approval.somiteeId,
            userId: approval.createdById,
          },
        });
        return expense.id;

      case 'bank':
        // Handle bank transactions (deposit/withdraw/transfer)
        const bankTx = await this.prisma.bankTransaction.create({
          data: {
            bankAccountId: payload.bankAccountId,
            type: payload.type, // deposit, withdraw, transfer
            amount: approval.amount,
            date: new Date(payload.date),
            note: payload.note,
            reference: payload.reference,
            balanceAfter: 0, // Will be updated after calculation
            somiteeId: approval.somiteeId,
            userId: approval.createdById,
          },
        });

        // Update bank account balance
        const bankAccount = await this.prisma.bankAccount.findUnique({
          where: { id: payload.bankAccountId },
        });
        if (bankAccount) {
          let newBalance = bankAccount.balance;
          if (payload.type === 'deposit') {
            newBalance += approval.amount;
          } else if (payload.type === 'withdraw') {
            newBalance -= approval.amount;
          }
          await this.prisma.bankAccount.update({
            where: { id: payload.bankAccountId },
            data: { balance: newBalance },
          });
          await this.prisma.bankTransaction.update({
            where: { id: bankTx.id },
            data: { balanceAfter: newBalance },
          });
        }
        return bankTx.id;

      case 'member':
        const member = await this.prisma.member.create({
          data: {
            name: payload.name,
            shopName: payload.shopName,
            phone: payload.phone,
            address: payload.address,
            nid: payload.nid,
            monthlyFee: payload.monthlyFee,
            billingCycle: payload.billingCycle,
            somiteeId: approval.somiteeId,
            userId: approval.createdById,
          },
        });
        return member.id;

      default:
        return null;
    }
  }
}