import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ApprovalType, GetApprovalsDto} from './dto/get-appovals.dto';
import {ApproveRejectDto} from './dto/approve-reject.dto';
import {CreateApprovalDto} from './dto/create-approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  // Get
  async getApprovals(somiteeId: number, query: GetApprovalsDto) {
    try {
      const {status = 'pending', type, createdBy, page = 1, limit = 20} = query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {somiteeId};

      if (status !== 'all') where.status = status;
      if (type) where.type = type;
      if (createdBy) where.createdById = Number(createdBy);

      const [approvals, total] = await Promise.all([
        this.prisma.approval.findMany({
          where,
          include: {
            createdBy: {select: {id: true, name: true}},
            reviewedBy: {select: {id: true, name: true}},
          },
          orderBy: {createdAt: 'desc'},
          skip,
          take: Number(limit),
        }),
        this.prisma.approval.count({where}),
      ]);

      const counts = await this.prisma.approval.groupBy({
        by: ['status'],
        where: {somiteeId},
        _count: true,
      });

      const statusCounts = {
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      counts.forEach((c: any) => {
        statusCounts[c.status as keyof typeof statusCounts] = c._count;
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('approvals.service.getApprovals error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      } else {
        console.error('approvals.service.getApprovals unknown error:', error);
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to getApprovals');
    }
  }

  async getApproval(id: number, somiteeId: number) {
    try {
      const approval = await this.prisma.approval.findFirst({
        where: {id, somiteeId},
        include: {
          createdBy: {select: {id: true, name: true}},
          reviewedBy: {select: {id: true, name: true}},
        },
      });
      if (!approval) {
        throw new NotFoundException('Approval not found');
      }
      return approval;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('approvals.service.service.getApproval error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('approvals.service.service.getApproval unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to getApproval');
    }
  }

  async createApproval(
    dto: CreateApprovalDto,
    userId: number,
    userName: string,
    somiteeId: number,
  ) {
    try {
      const permissionMap: Record<ApprovalType, string> = {
        collection: 'collection.create',
        expense: 'expense.create',
        bank: 'bank.create',
        member: 'member.create',
      };

      const requiredPermission = permissionMap[dto.type];

      if (!requiredPermission) {
        throw new BadRequestException('Invalid approval type');
      }

      const hasPermission = await this.checkUserPermission(userId, requiredPermission);

      if (!hasPermission) {
        throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
      }

      const user = await this.prisma.user.findUnique({
        where: {id: userId},
        select: {name: true},
      });

      const createdByName = user?.name ?? 'Unknown User';

      return await this.prisma.approval.create({
        data: {
          type: dto.type,
          title: dto.title,
          amount: dto.amount,
          description: dto.description,
          payload: dto.payload,

          createdById: BigInt(userId), // ✅ FIX
          createdByName: createdByName,

          somiteeId: BigInt(somiteeId), // ✅ FIX
        },
      });
    } catch (error: unknown) {
      console.error('approvals.createApproval error:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to createApproval');
    }
  }

  async approveApproval(
    id: number,
    dto: ApproveRejectDto,
    reviewerId: number,
    reviewerName: string,
    somiteeId: number,
  ) {
    try {
      const approval = await this.prisma.approval.findFirst({
        where: {
          id: BigInt(id),
          somiteeId: BigInt(somiteeId),
        },
      });

      if (!approval) {
        throw new NotFoundException('Approval not found');
      }

      if (approval.status !== 'pending') {
        throw new BadRequestException('Approval is not in pending status');
      }

      // Permission map
      const permissionMap: Record<string, string> = {
        collection: 'collection.approve',
        expense: 'expense.approve',
        bank: 'bank.approve',
        member: 'member.approve',
      };

      const requiredPermission = permissionMap[approval.type];

      if (!requiredPermission) {
        throw new BadRequestException('Invalid approval type');
      }

      const hasPermission = await this.checkUserPermission(reviewerId, requiredPermission);

      if (!hasPermission) {
        throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
      }

      // Create record first (safer flow)
      const createdRecordId = await this.createRecordFromApproval(approval);

      const updatedApproval = await this.prisma.approval.update({
        where: {id: BigInt(id)},
        data: {
          status: 'approved',
          reviewedById: BigInt(reviewerId),
          reviewedByName: reviewerName ?? 'Unknown',
          reviewedAt: new Date(),
          createdRecordId: createdRecordId ?? null,
        },
      });

      return updatedApproval;
    } catch (error: unknown) {
      console.error('approvals.approveApproval error:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to approveApproval');
    }
  }

  async rejectApproval(
    id: number,
    dto: ApproveRejectDto,
    reviewerId: number,
    reviewerName: string,
    somiteeId: number,
  ) {
    try {
      if (!dto.note) {
        throw new BadRequestException('Rejection note is required');
      }

      const approval = await this.prisma.approval.findFirst({
        where: {id, somiteeId},
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
        where: {id},
        data: {
          status: 'rejected',
          reviewedById: reviewerId,
          reviewedByName: reviewerName,
          reviewedAt: new Date(),
          rejectionNote: dto.note,
        },
      });

      return updatedApproval;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('approvals.service.service.rejectApproval error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          dto: dto,
          reviewerId: reviewerId,
          reviewerName: reviewerName,
          somiteeId: somiteeId,
        });
      } else {
        console.error('approvals.service.service.rejectApproval unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to rejectApproval');
    }
  }

  async getApprovalStats(somiteeId: number) {
    try {
      const sid = BigInt(Number(somiteeId));

      if (Number.isNaN(Number(somiteeId))) {
        throw new BadRequestException('Invalid somiteeId');
      }

      const counts = await this.prisma.approval.groupBy({
        by: ['type'],
        where: {
          somiteeId: sid,
          status: 'pending',
        },
        _count: {
          _all: true,
        },
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

      for (const item of counts) {
        const type = item.type as keyof typeof stats.byType;

        const count = item._count?._all ?? 0;

        if (type in stats.byType) {
          stats.byType[type] = count;
        }

        stats.totalPending += count;
      }

      return stats;
    } catch (error: unknown) {
      console.error('approvals.getApprovalStats error:', error);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to getApprovalStats');
    }
  }

  private async checkUserPermission(userId: number, permission: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      include: {
        roleAssignments: {
          include: {role: true},
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

  private async createRecordFromApproval(approval: any): Promise<any | null> {
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
            createdById: approval.createdById,
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
            createdById: approval.createdById,
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
            createdById: approval.createdById,
          },
        });

        // Update bank account balance
        const bankAccount = await this.prisma.bankAccount.findUnique({
          where: {id: payload.bankAccountId},
        });
        if (bankAccount) {
          let newBalance = bankAccount.balance;
          if (payload.type === 'deposit') {
            newBalance += approval.amount;
          } else if (payload.type === 'withdraw') {
            newBalance -= approval.amount;
          }
          await this.prisma.bankAccount.update({
            where: {id: payload.bankAccountId},
            data: {balance: newBalance},
          });
          await this.prisma.bankTransaction.update({
            where: {id: bankTx.id},
            data: {balanceAfter: newBalance},
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
            createdById: approval.createdById,
          },
        });
        return member.id;

      default:
        return null;
    }
  }
}
