import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ListRoleDto} from './dto/list-role.dto';
import {CreateRoleDto} from './dto/create-role.dto';
import {UpdateRoleDto} from './dto/update-role.dto';
import {AssignRoleDto} from './dto/assign-role.dto';
import {RemoveRoleDto} from './dto/role-assign-remove.dto';
import {GetRoleAssignmentsDto} from './dto/get-role-assignments.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Preset roles data
  private readonly PRESET_ROLES = [
    {
      id: 'role-collector',
      name: 'Collector',
      description: 'Can record collections, requires approval',
      permissions: ['collection.create'],
      isPreset: true,
    },
    {
      id: 'role-accountant',
      name: 'Accountant',
      description: 'Handles daily accounting tasks',
      permissions: ['collection.create', 'expense.create', 'bank.create', 'reports.view'],
      isPreset: true,
    },
    {
      id: 'role-approver',
      name: 'Approver',
      description: 'Can approve/reject financial transactions',
      permissions: [
        'collection.approve',
        'expense.approve',
        'bank.approve',
        'member.approve',
        'reports.view',
      ],
      isPreset: true,
    },
    {
      id: 'role-viewer',
      name: 'Viewer',
      description: 'Read-only access to reports',
      permissions: ['reports.view'],
      isPreset: true,
    },
  ];

  // Service methods with error handling and logging
  // Each method includes try-catch blocks to log errors and throw appropriate HTTP exceptions
  // This ensures that the API provides meaningful error messages and logs detailed information for debugging
  async getRoles(somiteeId?: number, query?: ListRoleDto) {
    try {
      const where: any = {};

      if (somiteeId !== undefined) {
        where.somiteeId = BigInt(somiteeId);
      } else {
        where.somiteeId = null;
      }

      if (query?.name) {
        where.name = {
          contains: query.name,
        };
      }

      const roles = await this.prisma.role.findMany({
        where,
        include: {
          somitee: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return roles;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.getRoles error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          query,
        });
      }

      throw new InternalServerErrorException('Failed to get roles');
    }
  }

  // Create a new role with error handling and logging
  // Validates input data and checks for duplicate role names before creating a new role
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method also handles the association of the new role with the correct somitee based on the user's role (super_admin vs regular user)
  // This ensures that the role creation process is robust and provides clear feedback in case of errors.
  async createRole(dto: CreateRoleDto, somiteeId: number, userRole: string) {
    try {
      const isSuperAdmin = userRole === 'super_admin';

      const where: any = {
        name: dto.name,
        somiteeId: isSuperAdmin ? null : BigInt(somiteeId),
      };

      // 🔍 Check duplicate
      const existing = await this.prisma.role.findFirst({where});

      if (existing) {
        throw new ConflictException('Role name already exists');
      }

      const role = await this.prisma.role.create({
        data: {
          name: dto.name,
          description: dto.description,
          permissions: dto.permissions ?? [],
          somiteeId: isSuperAdmin ? null : BigInt(somiteeId),
        },
      });

      return role;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.createRole error:', {
          message: error.message,
          stack: error.stack,
          dto,
          somiteeId,
          userRole,
        });
      }

      if (error instanceof ConflictException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to create role');
    }
  }

  // Update an existing role with error handling and logging
  // Validates input data, checks for role existence, and ensures that preset roles cannot be renamed
  // Also checks for duplicate role names when updating the name of a role
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that updates are made within the correct organizational context.
  async updateRole(id: number, dto: UpdateRoleDto, somiteeId: number, userRole: string) {
    try {
      const isSuperAdmin = userRole === 'super_admin';

      const where: any = {
        id,
        somiteeId: isSuperAdmin ? null : BigInt(somiteeId),
      };

      // 🔍 Find role
      const role = await this.prisma.role.findFirst({where});

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // 🚫 Prevent preset rename
      if (role.isPreset && dto.name) {
        throw new ForbiddenException('Cannot rename preset roles');
      }

      // 🔁 Name uniqueness check
      if (dto.name && dto.name !== role.name) {
        const existing = await this.prisma.role.findFirst({
          where: {
            name: dto.name,
            somiteeId: isSuperAdmin ? null : BigInt(somiteeId),
          },
        });

        if (existing) {
          throw new ConflictException('Role name already exists');
        }
      }

      // 🧠 Build update payload safely (avoid undefined overwrite)
      const data: any = {};

      if (dto.name !== undefined) data.name = dto.name;
      if (dto.description !== undefined) data.description = dto.description;
      if (dto.permissions !== undefined) data.permissions = dto.permissions;

      const updatedRole = await this.prisma.role.update({
        where: {id},
        data,
      });

      return updatedRole;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.updateRole error:', {
          message: error.message,
          stack: error.stack,
          id,
          dto,
          somiteeId,
          userRole,
        });
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update role');
    }
  }

  // Delete a role with error handling and logging
  // Validates the role ID, checks for role existence, and ensures that preset roles cannot be deleted
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that deletions are made within the correct organizational context.
  async deleteRole(id: number, somiteeId: number, userRole: string) {
    try {
      const isSuperAdmin = userRole === 'super_admin';

      const where: any = {
        id,
        somiteeId: isSuperAdmin ? null : BigInt(somiteeId),
      };

      // 🔍 Find role
      const role = await this.prisma.role.findFirst({where});

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // 🚫 Prevent deleting preset
      if (role.isPreset) {
        throw new ForbiddenException('Cannot delete preset roles');
      }

      // 🔒 Transaction নিরাপদ delete
      await this.prisma.$transaction([
        this.prisma.userRoleAssignment.deleteMany({
          where: {roleId: id},
        }),

        this.prisma.role.delete({
          where: {id},
        }),
      ]);

      return {message: 'Role deleted successfully'};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.deleteRole error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
          userRole,
        });
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete role');
    }
  }

  // Assign a role to a user with error handling and logging
  // Validates input data, checks for user and role existence, and ensures that the user belongs to the correct somitee
  // Also checks for duplicate role assignments to prevent assigning the same role multiple times to a user
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that role assignments are made within the correct organizational context.
  async assignRole(dto: AssignRoleDto, somiteeId: number, userRole: string) {
    try {
      const isSuperAdmin = userRole === 'super_admin';

      // 🔍 Verify user belongs to somitee
      const user = await this.prisma.user.findFirst({
        where: {
          id: dto.userId,
          somiteeId: isSuperAdmin ? undefined : BigInt(somiteeId),
        },
      });

      if (!user) {
        throw new NotFoundException('User not found in this somitee');
      }

      // 🔍 Verify role exists (global + somitee role)
      const role = await this.prisma.role.findFirst({
        where: {
          id: dto.roleId,
          OR: [{somiteeId: isSuperAdmin ? undefined : BigInt(somiteeId)}, {somiteeId: null}],
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // 🔒 Transaction (race condition safe)
      const assignment = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.userRoleAssignment.findUnique({
          where: {
            userId_roleId: {
              userId: dto.userId,
              roleId: dto.roleId,
            },
          },
        });

        if (existing) {
          throw new ConflictException('Role already assigned to user');
        }

        return tx.userRoleAssignment.create({
          data: {
            userId: dto.userId,
            roleId: dto.roleId,
          },
          include: {
            role: true,
          },
        });
      });

      return {
        userId: assignment.userId,
        roleId: assignment.roleId,
        roleName: assignment.role.name,
        assignedAt: assignment.assignedAt,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.assignRole error:', {
          message: error.message,
          stack: error.stack,
          dto,
          somiteeId,
          userRole,
        });
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to assign role');
    }
  }

  //  Remove a role from a user with error handling and logging
  // Validates input data, checks for user and role existence, and ensures that the user belongs to the correct somitee
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that role removals are made within the correct organizational context.
  async removeAssignRole(dto: RemoveRoleDto, somiteeId: number, userRole: string) {
    try {
      const isSuperAdmin = userRole === 'super_admin';

      // 🔍 Verify user belongs to somitee
      const user = await this.prisma.user.findFirst({
        where: {
          id: dto.userId,
          somiteeId: isSuperAdmin ? undefined : BigInt(somiteeId),
        },
      });

      if (!user) {
        throw new NotFoundException('User not found in this somitee');
      }

      // 🔍 Verify role belongs to somitee OR global
      const role = await this.prisma.role.findFirst({
        where: {
          id: dto.roleId,
          OR: [{somiteeId: isSuperAdmin ? undefined : BigInt(somiteeId)}, {somiteeId: null}],
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // 🔒 Transaction safe remove
      await this.prisma.$transaction(async (tx) => {
        const assignment = await tx.userRoleAssignment.findUnique({
          where: {
            userId_roleId: {
              userId: dto.userId,
              roleId: dto.roleId,
            },
          },
        });

        if (!assignment) {
          throw new NotFoundException('Role assignment not found');
        }

        await tx.userRoleAssignment.delete({
          where: {
            userId_roleId: {
              userId: dto.userId,
              roleId: dto.roleId,
            },
          },
        });
      });

      return {message: 'Role removed successfully'};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.removeRole error:', {
          message: error.message,
          stack: error.stack,
          dto,
          somiteeId,
          userRole,
        });
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove role');
    }
  }

  // Get role assignments with error handling and logging
  // Validates input data, checks for user and role existence, and ensures that the user belongs to the correct somitee
  // Supports pagination and filtering by user ID, and logs detailed error information if the operation fails
  // The method handles both super_admin and regular user roles to ensure that role assignment retrieval is made within the correct organizational context.
  // It returns a paginated list of role assignments with user and role details, along with metadata about the pagination state.
  async getRoleAssignments(somiteeId: number, userRole: string, query: GetRoleAssignmentsDto) {
    try {
      const isSuperAdmin = userRole === 'super_admin';

      const page = Number(query.page || 1);
      const limit = Number(query.limit || 20);
      const userId = query.userId ? Number(query.userId) : undefined;

      const where: any = {
        user: {
          somiteeId: isSuperAdmin ? undefined : BigInt(somiteeId),
        },
      };

      if (userId) {
        where.userId = userId;
      }

      const [data, total] = await Promise.all([
        this.prisma.userRoleAssignment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {id: true, name: true, email: true},
            },
            role: true,
          },
          orderBy: {assignedAt: 'desc'},
        }),
        this.prisma.userRoleAssignment.count({where}),
      ]);

      return {
        data: data.map((assignment: any) => ({
          userId: assignment.user.id,
          userName: assignment.user.name,
          userEmail: assignment.user.email,
          roleId: assignment.role.id,
          roleName: assignment.role.name,
          assignedAt: assignment.assignedAt,
        })),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.getRoleAssignments error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          userRole,
          query,
        });
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to get role assignments');
    }
  }

  async getUserPermissions(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {id: userId},
        include: {
          roleAssignments: {
            include: {role: true},
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const permissionSet = new Set<string>();

      user.roleAssignments.forEach((assignment) => {
        const rolePermissions = assignment.role.permissions;

        if (Array.isArray(rolePermissions)) {
          rolePermissions.forEach((p) => {
            if (typeof p === 'string') {
              permissionSet.add(p);
            }
          });
        }
      });

      const permissionsArray = Array.from(permissionSet);

      // Optional grouping (very useful for frontend)
      const groupedPermissions = permissionsArray.reduce(
        (acc, perm) => {
          const [module, action] = perm.split('.');
          if (!acc[module]) acc[module] = [];
          acc[module].push(action);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      return {
        userId: user.id,
        roles: user.roleAssignments.map((a) => a.role.name),
        permissions: permissionsArray,
        groupedPermissions,
      };
    } catch (error) {
      console.error('getUserPermissions error:', error);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to getUserPermissions');
    }
  }

  async seedPresetRoles(somiteeId: number) {
    try {
      for (const presetRole of this.PRESET_ROLES) {
        const existing = await this.prisma.role.findUnique({
          where: {id: BigInt(presetRole.id)},
        });
        if (!existing) {
          await this.prisma.role.create({
            data: {
              id: BigInt(presetRole.id),
              name: presetRole.name,
              description: presetRole.description,
              permissions: presetRole.permissions,
              isPreset: true,
              somiteeId: null, // Preset roles are global
            },
          });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('roles.service.service.seedPresetRoles error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
        });
      } else {
        console.error('roles.service.service.seedPresetRoles unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to seedPresetRoles');
    }
  }
}
