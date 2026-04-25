import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {ChangePasswordDto} from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import {UpdatePrintTemplateDto} from './dto/update.print.template.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: add more methods for other settings related operations
  // Each method should have proper error handling and logging
  // The methods should return consistent response formats and handle edge cases gracefully
  // For example, if a user tries to update their profile with invalid data, the service should return a BadRequestException with a clear error message
  // Similarly, if a user tries to access a profile that doesn't exist, the service should return a NotFoundException
  // The service should also log any errors that occur during the execution of these methods, including the error message, stack trace, and any relevant input data that can help with debugging
  // This will help us maintain a robust and user-friendly settings module in our application
  async profile(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {id: BigInt(userId)},
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          somiteeId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Profile not found');
      }

      return {
        data: user,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.profile error:', {
          message: error.message,
          stack: error.stack,
          userId,
        });
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to get profile');
    }
  }

  // TODO: implement changePassword method with proper validation and error handling
  // The method should verify the current password, hash the new password, and update it in the database
  // It should also handle cases where the current password is incorrect or the new password doesn't meet certain criteria (e.g., minimum length, complexity requirements)
  // The method should return appropriate error messages for different failure scenarios, and log any errors that occur during the process for debugging purposes
  // This will ensure that users can securely change their passwords while providing a good user experience and maintaining the integrity of our application
  // Additionally, we should consider implementing rate limiting or other security measures to prevent brute-force attacks on the change password endpoint

  async updateProfile(userId: number, body: UpdateProfileDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {id: BigInt(userId)},
      });

      if (!user) {
        throw new NotFoundException('Profile not found');
      }

      const updatedUser = await this.prisma.user.update({
        where: {id: BigInt(userId)},
        data: {
          ...(body.name && {name: body.name}),
          ...(body.phone && {phone: body.phone}),
          // ...(body.email && {email: body.email}),
        },
      });

      return {
        message: 'Profile updated successfully',
        data: updatedUser,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.updateProfile error:', {
          message: error.message,
          stack: error.stack,
          userId,
          body,
        });
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async changePassword(userId: number, body: ChangePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {id: BigInt(userId)},
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 1. verify current password
      const isPasswordValid = await bcrypt.compare(body.currentPassword, user.password);

      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // 2. hash new password
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);

      // 3. update password
      await this.prisma.user.update({
        where: {id: BigInt(userId)},
        data: {
          password: hashedPassword,
        },
      });

      return {
        message: 'Password changed successfully',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.changePassword error:', {
          message: error.message,
          stack: error.stack,
          userId,
          body,
        });
      } else {
        console.error('settings.changePassword unknown error:', error);
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to change password');
    }
  }
  async printTemplate() {
    try {
      const template = await this.prisma.printTemplate.findFirst();

      if (!template) {
        throw new NotFoundException('Print template not found');
      }

      return template;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.printTemplate error:', {
          message: error.message,
          stack: error.stack,
        });
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to fetch print template');
    }
  }

  async updatePrintTemplate(body: UpdatePrintTemplateDto) {
    try {
      return await this.prisma.printTemplate.upsert({
        where: {
          id: BigInt(1),
        },
        create: {
          id: BigInt(1),
          showLogo: body.showLogo ?? true,
          showCompanyName: body.showCompanyName ?? true,
          showSignature: body.showSignature ?? true,
          paperSize: body.paperSize ?? 'A4',
          orientation: body.orientation ?? 'portrait',
          marginTop: body.marginTop ?? 20,
          marginBottom: body.marginBottom ?? 20,
          marginLeft: 15,
          marginRight: 15,
          showFooterNotes: true,
          footerNotes: '',
        },
        update: {
          ...(body.showLogo !== undefined && {showLogo: body.showLogo}),
          ...(body.showCompanyName !== undefined && {
            showCompanyName: body.showCompanyName,
          }),
          ...(body.showSignature !== undefined && {
            showSignature: body.showSignature,
          }),
          ...(body.paperSize && {paperSize: body.paperSize}),
          ...(body.orientation && {orientation: body.orientation}),
          ...(body.marginTop !== undefined && {marginTop: body.marginTop}),
          ...(body.marginBottom !== undefined && {
            marginBottom: body.marginBottom,
          }),
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.updatePrintTemplate error:', {
          message: error.message,
          stack: error.stack,
          body,
        });
      }

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to update print template');
    }
  }
}
