import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(somiteeId: string, query: any = {}) {
    const { status, roleId, q, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      somiteeId,
      isManaged: true, // Only managed users
    };

    if (status) where.status = status;
    if (roleId) {
      where.roleAssignments = {
        some: { roleId },
      };
    }
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          roleAssignments: {
            include: { role: true },
          },
          somitee: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      someiteeName: user.somitee?.name,
      roleIds: (user.roleIds as string[]) || [],
      status: user.status,
      createdAt: user.createdAt,
    }));

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string, somiteeId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, somiteeId, isManaged: true },
      include: {
        roleAssignments: {
          include: { role: true },
        },
        somitee: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      someiteeName: user.somitee?.name,
      roleIds: (user.roleIds as string[]) || [],
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async createUser(dto: CreateUserDto, somiteeId: string, createdById: string) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    // Validate password length
    if (dto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Validate roleIds exist
    if (dto.roleIds && dto.roleIds.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: dto.roleIds } },
      });
      if (roles.length !== dto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: dto.role,
        somiteeId,
        roleIds: dto.roleIds || [],
        isManaged: true,
        userId: createdById, // createdBy
      },
    });

    // Create role assignments
    if (dto.roleIds && dto.roleIds.length > 0) {
      const assignments = dto.roleIds.map((roleId: string) => ({
        userId: user.id,
        roleId,
      }));
      await this.prisma.userRoleAssignment.createMany({
        data: assignments,
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      someiteeName: 'Current Somitee', // Will be resolved
      roleIds: dto.roleIds || [],
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async updateUser(id: string, dto: UpdateUserDto, somiteeId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, somiteeId, isManaged: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate roleIds if provided
    if (dto.roleIds) {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: dto.roleIds } },
      });
      if (roles.length !== dto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.role) updateData.role = dto.role;
    if (dto.status) updateData.status = dto.status;
    if (dto.roleIds !== undefined) updateData.roleIds = dto.roleIds;

    if (dto.password) {
      if (dto.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }
      updateData.password = await bcrypt.hash(dto.password, 12);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update role assignments if roleIds provided
    if (dto.roleIds !== undefined) {
      // Remove existing assignments
      await this.prisma.userRoleAssignment.deleteMany({
        where: { userId: id },
      });

      // Create new assignments
      if (dto.roleIds.length > 0) {
        const assignments = dto.roleIds.map((roleId: string) => ({
          userId: id,
          roleId,
        }));
        await this.prisma.userRoleAssignment.createMany({
          data: assignments,
        });
      }
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    };
  }

  async deleteUser(id: string, somiteeId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, somiteeId, isManaged: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove role assignments
    await this.prisma.userRoleAssignment.deleteMany({
      where: { userId: id },
    });

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async resetPassword(id: string, somiteeId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, somiteeId, isManaged: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a random password
    const newPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      userId: id,
      newPassword,
    };
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}