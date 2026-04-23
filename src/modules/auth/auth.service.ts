import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../../prisma/prisma.service';
import {LoginDto} from './dto/login.dto';
import {RegisterDto} from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({where: {email}});
      if (!user || !user.password) {
        return null;
      }
      console.log('user', user);

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return null;
      }
      const {password: _password, ...safeUser} = user;
      return safeUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('auth.service.service.validateUser error:', {
          message: error.message,
          stack: error.stack,
          email: email,
          password: password,
        });
      } else {
        console.error('auth.service.service.validateUser unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to validateUser');
    }
  }
  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {email: dto.email},
        include: {
          somitee: {select: {id: true, name: true}},
          roleAssignments: {
            include: {role: true},
          },
        },
      });

      if (!user || !user.password || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (user.isManaged && user.status === 'inactive') {
        throw new UnauthorizedException('Account is inactive');
      }

      const permissions = await this.getUserPermissions(user);

      // ১. প্রথমে roleIds কে BigInt অ্যারে হিসেবে কাস্ট করে নিন
      // ১. প্রথমে unknown-এ কনভার্ট করে তারপর bigint[] হিসেবে কাস্ট করুন
      const roleIds = (user.roleIds as unknown) as bigint[]; 

      const payload = {
        sub: user.id.toString(),
        email: user.email,
        role: user.role,
        somiteeId: user.somiteeId?.toString(),
        permissions,
        // ২. টাইপ-সেফ উপায়ে ম্যাপ করুন
        roleIds: Array.isArray(roleIds) ? roleIds.map((id) => id.toString()) : [],
      };

      const response: any = {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          somiteeId: user.somiteeId?.toString(),
          someiteeName: user.somitee?.name,
          phone: user.phone,
          isManagedUser: user.isManaged,
        },
        token: this.jwtService.sign(payload),
        expiresIn: 3600,
      };

      // ১. ফাংশনের শুরুতে বা পেলোডের আগে এটি একবারে কাস্ট করে নিন
      const roleIdsArray = (user.roleIds as unknown) as bigint[];

      // ... পেলোড এবং রেসপন্স অবজেক্ট তৈরির কোড ...

      if (user.isManaged) {
        // ২. ভুলটি এখানে ছিল: সরাসরি user.roleIds না লিখে কাস্ট করা roleIdsArray ব্যবহার করুন
        response.user.roleIds = Array.isArray(roleIdsArray) 
          ? roleIdsArray.map((id) => id.toString()) 
          : [];
          
        response.user.permissions = permissions;
      }

      return response;
    } catch (error: unknown) {
      // এরর হ্যান্ডলিং আগের মতোই থাকবে...
      if (error instanceof Error) {
        console.error('auth.service.service.login error:', {
          message: error.message,
          stack: error.stack,
          dto: dto,
        });
      }

      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to login');
    }
  }

  private async getUserPermissions(user: any): Promise<string[]> {
    // Super admin and main user have all permissions
    if (user.role === 'super_admin' || user.role === 'main_user') {
      return ['*']; // All permissions
    }

    // For managed users, collect permissions from assigned roles
    const permissions = new Set<string>();
    if (user.roleAssignments) {
      user.roleAssignments.forEach((assignment: any) => {
        if (assignment.role && assignment.role.permissions) {
          const rolePermissions = assignment.role.permissions as string[];
          if (Array.isArray(rolePermissions)) {
            rolePermissions.forEach((permission) => permissions.add(permission));
          }
        }
      });
    }

    return Array.from(permissions);
  }

  async forgotPassword(body: any) {
    try {
      const user = await this.prisma.user.findUnique({where: {email: body.email}});
      if (!user) {
        throw new NotFoundException('No account found with this email');
      }
      return {message: 'Password reset link sent to your email', data: null};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('auth.service.service.forgotPassword error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('auth.service.service.forgotPassword unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to forgotPassword');
    }
  }

  async resetPassword(body: any) {
    try {
      // TODO: validate reset token and update password
      return {message: 'Password reset successful', data: null};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('auth.service.service.resetPassword error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('auth.service.service.resetPassword unknown error:', error);
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

  async refreshToken(body: any) {
    try {
      return {
        token: this.jwtService.sign({sub: 'user-id', email: 'refresh@example.com'}),
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('auth.service.service.refreshToken error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('auth.service.service.refreshToken unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to refreshToken');
    }
  }

  async logout() {
    try {
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('auth.service.service.logout error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('auth.service.service.logout unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to logout');
    }
  }

  async register(dto: RegisterDto) {
    try {
      const existing = await this.prisma.user.findUnique({where: {email: dto.email}});
      if (existing) {
        throw new ForbiddenException('Email already registered');
      }
      const password = await bcrypt.hash(dto.password, 12);
      const somitee = await this.prisma.somitee.create({
        data: {
          name: dto.somiteeName,
          email: dto.email,
          phone: dto.phone,
        },
      });
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password,
          phone: dto.phone,
          role: 'main_user',
          somiteeId: somitee.id,
        },
      });
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        somiteeId: user.somiteeId,
      };
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          somiteeId: user.somiteeId,
          phone: user.phone,
        },
        token: this.jwtService.sign(payload),
        expiresIn: 3600,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('auth.service.service.register error:', {
          message: error.message,
          stack: error.stack,
          dto: dto,
        });
      } else {
        console.error('auth.service.service.register unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to register');
    }
  }
}
