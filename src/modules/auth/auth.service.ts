import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return null;
    }
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async login(dto: LoginDto) {
    // First try built-in users (super_admin, main_user, member)
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        somitee: { select: { id: true, name: true } },
        roleAssignments: {
          include: { role: true },
        },
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if managed user is active
    if (user.isManaged && user.status === 'inactive') {
      throw new UnauthorizedException('Account is inactive');
    }

    // Get permissions for the user
    const permissions = await this.getUserPermissions(user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      somiteeId: user.somiteeId,
      permissions,
      roleIds: user.roleIds,
    };

    const response: any = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        somiteeId: user.somiteeId,
        someiteeName: user.somitee?.name,
        phone: user.phone,
        isManagedUser: user.isManaged,
      },
      token: this.jwtService.sign(payload),
      expiresIn: 3600,
    };

    // Include roleIds and permissions for managed users
    if (user.isManaged) {
      response.user.roleIds = user.roleIds;
      response.user.permissions = permissions;
    }

    return response;
  }

  private async getUserPermissions(user: any): Promise<string[]> {
    // Super admin and main user have all permissions
    if (user.role === 'super_admin' || user.role === 'main_user') {
      return ['*']; // All permissions
    }

    // For managed users, collect permissions from assigned roles
    const permissions = new Set<string>();
    user.roleAssignments.forEach((assignment: any) => {
      const rolePermissions = assignment.role.permissions as string[];
      rolePermissions.forEach(permission => permissions.add(permission));
    });

    return Array.from(permissions);
  }

  async forgotPassword(body: any) {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      throw new NotFoundException('No account found with this email');
    }
    return { message: 'Password reset link sent to your email', data: null };
  }

  async resetPassword(body: any) {
    // TODO: validate reset token and update password
    return { message: 'Password reset successful', data: null };
  }

  async refreshToken(body: any) {
    return {
      token: this.jwtService.sign({ sub: 'user-id', email: 'refresh@example.com' }),
      refreshToken: 'new-refresh-token',
      expiresIn: 3600
    };
  }

  async logout() {
    return null;
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ForbiddenException('Email already registered');
    }
    const password = await bcrypt.hash(dto.password, 12);
    const somitee = await this.prisma.somitee.create({
      data: {
        name: dto.somiteeName,
        email: dto.email,
        phone: dto.phone
      }
    });
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password,
        phone: dto.phone,
        role: 'main_user',
        somiteeId: somitee.id
      }
    });
    const payload = { sub: user.id, email: user.email, role: user.role, somiteeId: user.somiteeId };
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        somiteeId: user.somiteeId,
        phone: user.phone
      },
      token: this.jwtService.sign(payload),
      expiresIn: 3600
    };
  }
}
