import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, RemoveRoleDto } from './dto/roles.dto';

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
      permissions: ['collection.approve', 'expense.approve', 'bank.approve', 'member.approve', 'reports.view'],
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

  async getRoles(somiteeId?: string) {
    const where = somiteeId ? { somiteeId } : { somiteeId: null };
    const roles = await this.prisma.role.findMany({
      where,
      include: { somitee: true },
      orderBy: { createdAt: 'asc' },
    });
    return roles;
  }

  async createRole(dto: CreateRoleDto, somiteeId: string, userRole: string) {
    // Check if role name already exists
    const existing = await this.prisma.role.findFirst({
      where: { name: dto.name, somiteeId },
    });
    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions || [],
        somiteeId,
      },
    });
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto, somiteeId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, somiteeId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isPreset && dto.name) {
      throw new ForbiddenException('Cannot rename preset roles');
    }

    // Check name uniqueness if updating name
    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findFirst({
        where: { name: dto.name, somiteeId },
      });
      if (existing) {
        throw new ConflictException('Role name already exists');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
      },
    });
    return updatedRole;
  }

  async deleteRole(id: string, somiteeId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, somiteeId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isPreset) {
      throw new ForbiddenException('Cannot delete preset roles');
    }

    // Remove all assignments first
    await this.prisma.userRoleAssignment.deleteMany({
      where: { roleId: id },
    });

    await this.prisma.role.delete({
      where: { id },
    });
    return { message: 'Role deleted successfully' };
  }

  async assignRole(dto: AssignRoleDto, somiteeId: string) {
    // Verify user belongs to somitee
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, somiteeId },
    });
    if (!user) {
      throw new NotFoundException('User not found in this somitee');
    }

    // Verify role exists
    const role = await this.prisma.role.findFirst({
      where: { id: dto.roleId, OR: [{ somiteeId }, { somiteeId: null }] },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if assignment already exists
    const existing = await this.prisma.userRoleAssignment.findUnique({
      where: { userId_roleId: { userId: dto.userId, roleId: dto.roleId } },
    });
    if (existing) {
      throw new ConflictException('Role already assigned to user');
    }

    const assignment = await this.prisma.userRoleAssignment.create({
      data: {
        userId: dto.userId,
        roleId: dto.roleId,
      },
      include: { role: true },
    });

    return {
      userId: assignment.userId,
      roleId: assignment.roleId,
      roleName: assignment.role.name,
      assignedAt: assignment.assignedAt,
    };
  }

  async removeRole(dto: RemoveRoleDto) {
    const assignment = await this.prisma.userRoleAssignment.findUnique({
      where: { userId_roleId: { userId: dto.userId, roleId: dto.roleId } },
    });
    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.prisma.userRoleAssignment.delete({
      where: { userId_roleId: { userId: dto.userId, roleId: dto.roleId } },
    });
    return { message: 'Role removed successfully' };
  }

  async getRoleAssignments(somiteeId: string, userId?: string) {
    const where = userId ? { user: { somiteeId }, userId } : { user: { somiteeId } };
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        role: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((assignment: any) => ({
      userId: assignment.user.id,
      userName: assignment.user.name,
      roleId: assignment.role.id,
      roleName: assignment.role.name,
      assignedAt: assignment.assignedAt,
    }));
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: { role: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = new Set<string>();
    user.roleAssignments.forEach(assignment => {
      const rolePermissions = assignment.role.permissions as string[];
      rolePermissions.forEach(permission => permissions.add(permission));
    });

    return {
      userId: user.id,
      permissions: Array.from(permissions),
      roles: user.roleAssignments.map((a: any) => a.role.name),
    };
  }

  async seedPresetRoles(somiteeId: string) {
    for (const presetRole of this.PRESET_ROLES) {
      const existing = await this.prisma.role.findUnique({
        where: { id: presetRole.id },
      });
      if (!existing) {
        await this.prisma.role.create({
          data: {
            id: presetRole.id,
            name: presetRole.name,
            description: presetRole.description,
            permissions: presetRole.permissions,
            isPreset: true,
            somiteeId: null, // Preset roles are global
          },
        });
      }
    }
  }
}