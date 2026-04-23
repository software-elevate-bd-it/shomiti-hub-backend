import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {CreateUserDto, UpdateUserDto} from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(somiteeId: number, query: any = {}) {
    try {
      const {status, roleId, q, page = 1, limit = 20} = query;
      const skip = (page - 1) * limit;

      const where: any = {
        somiteeId,
        isManaged: true, // Only managed users
      };

      if (status) where.status = status;
      if (roleId) {
        where.roleAssignments = {
          some: {roleId},
        };
      }
      if (q) {
        where.OR = [{name: {contains: q}}, {email: {contains: q}}];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          include: {
            roleAssignments: {
              include: {role: true},
            },
            somitee: {
              select: {id: true, name: true},
            },
          },
          orderBy: {createdAt: 'desc'},
          skip,
          take: limit,
        }),
        this.prisma.user.count({where}),
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('users.service.service.getUsers error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          query: query,
        });
      } else {
        console.error('users.service.service.getUsers unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to getUsers');
    }
  }

  async getUser(id: number, somiteeId: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {id, somiteeId, isManaged: true},
        include: {
          roleAssignments: {
            include: {role: true},
          },
          somitee: {
            select: {id: true, name: true},
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('users.service.service.getUser error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('users.service.service.getUser unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to getUser');
    }
  }

  async createUser(dto: CreateUserDto, somiteeId: number, createdById: number) {
    try {
      // Check if email already exists
      const existing = await this.prisma.user.findUnique({
        where: {email: dto.email},
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
        // ১. প্রথমে স্ট্রিং অ্যারেটিকে বিগ-ইন্ট অ্যারেতে রূপান্তর করুন
        const roleIdsAsBigInt = dto.roleIds.map((id: string) => BigInt(id));

        const roles = await this.prisma.role.findMany({
          where: {
            // ২. রূপান্তরিত অ্যারেটি এখানে ব্যবহার করুন
            id: {in: roleIdsAsBigInt},
          },
        });

        // ৩. ভ্যালিডেশন চেক আগের মতোই থাকবে
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
          createdById: createdById, 
        },
      });

      // Create role assignments
      if (dto.roleIds && dto.roleIds.length > 0) {
        const assignments = dto.roleIds.map((roleId: string) => ({
          // ১. যাকে রোল দেওয়া হচ্ছে (নতুন তৈরি হওয়া ইউজার)
          userId: BigInt(user.id), 
          
          // ২. যে রোলটি দেওয়া হচ্ছে
          roleId: BigInt(roleId),
          
          // ৩. কে এই এন্ট্রিটি তৈরি করছে (অপশনাল, যদি আপনার স্কিমায় থাকে)
          // createdById: BigInt(createdById), 
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('users.service.service.createUser error:', {
          message: error.message,
          stack: error.stack,
          dto: dto,
          somiteeId: somiteeId,
          createdById: createdById,
        });
      } else {
        console.error('users.service.service.createUser unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to createUser');
    }
  }

  async updateUser(id: number, dto: UpdateUserDto, somiteeId: number) {
    try {
     const user = await this.prisma.user.findFirst({
        where: {
          id: BigInt(id),           // id-কে BigInt এ রূপান্তর
          somiteeId: BigInt(somiteeId), // somiteeId-কে BigInt এ রূপান্তর
          isManaged: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate roleIds if provided
      if (dto.roleIds && dto.roleIds.length > 0) {
        // ১. স্ট্রিং অ্যারে থেকে বিগ-ইন্ট অ্যারেতে রূপান্তর
        const roleIdsAsBigInt = dto.roleIds.map((roleId: string) => BigInt(roleId));

        const roles = await this.prisma.role.findMany({
          where: {
            id: { in: roleIdsAsBigInt }, // ২. এখানে রূপান্তরিত অ্যারে ব্যবহার করুন
          },
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
        where: {id},
        data: updateData,
      });

      // Update role assignments if roleIds provided
      if (dto.roleIds !== undefined) {
        // ১. existing assignments রিমুভ করার সময় id কে BigInt এ কাস্ট করুন
        await this.prisma.userRoleAssignment.deleteMany({
          where: { userId: BigInt(id) },
        });

        // ২. নতুন assignments তৈরি করুন
        if (dto.roleIds.length > 0) {
          const assignments = dto.roleIds.map((roleId: string) => ({
            // userId এবং roleId উভয়কেই BigInt এ কনভার্ট করা হয়েছে
            userId: BigInt(id),
            roleId: BigInt(roleId),
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('users.service.service.updateUser error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          dto: dto,
          somiteeId: somiteeId,
        });
      } else {
        console.error('users.service.service.updateUser unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to updateUser');
    }
  }

  async deleteUser(id: number, somiteeId: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {id, somiteeId, isManaged: true},
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Remove role assignments
      await this.prisma.userRoleAssignment.deleteMany({
        where: {userId: id},
      });

      // Delete user
      await this.prisma.user.delete({
        where: {id},
      });

      return {message: 'User deleted successfully'};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('users.service.service.deleteUser error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('users.service.service.deleteUser unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to deleteUser');
    }
  }

  async resetPassword(id: number, somiteeId: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {id, somiteeId, isManaged: true},
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate a random password
      const newPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.user.update({
        where: {id},
        data: {password: hashedPassword},
      });

      return {
        userId: id,
        newPassword,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('users.service.service.resetPassword error:', {
          message: error.message,
          stack: error.stack,
          id: id,
          somiteeId: somiteeId,
        });
      } else {
        console.error('users.service.service.resetPassword unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to resetPassword');
    }
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
