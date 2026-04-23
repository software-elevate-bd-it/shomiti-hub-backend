import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({where: {id: userId}});
      if (!user) {
        throw new NotFoundException('Profile not found');
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.service.service.profile error:', {
          message: error.message,
          stack: error.stack,
          userId: userId,
        });
      } else {
        console.error('settings.service.service.profile unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to profile');
    }
  }

  async updateProfile(userId: number, body: any) {
    try {
      return this.prisma.user.update({where: {id: userId}, data: body});
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.service.service.updateProfile error:', {
          message: error.message,
          stack: error.stack,
          userId: userId,
          body: body,
        });
      } else {
        console.error('settings.service.service.updateProfile unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to updateProfile');
    }
  }

  async changePassword(userId: number, body: any) {
    try {
      // TODO: verify currentPassword and hash new password
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.service.service.changePassword error:', {
          message: error.message,
          stack: error.stack,
          userId: userId,
          body: body,
        });
      } else {
        console.error('settings.service.service.changePassword unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to changePassword');
    }
  }

  async printTemplate() {
    try {
      return this.prisma.printTemplate.findFirst();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.service.service.printTemplate error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('settings.service.service.printTemplate unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to printTemplate');
    }
  }

  async updatePrintTemplate(body: any) {
    try {
      return this.prisma.printTemplate.upsert({
        where: {
          id: BigInt(1), // স্ট্রিং 'default' এর বদলে BigInt ব্যবহার করা হয়েছে
        },
        create: {
          id: BigInt(1),
          ...body,
        },
        update: body,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('settings.service.service.updatePrintTemplate error:', {
          message: error.message,
          stack: error.stack,
          body: body,
        });
      } else {
        console.error('settings.service.service.updatePrintTemplate unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to updatePrintTemplate');
    }
  }
}
