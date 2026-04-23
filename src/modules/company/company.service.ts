import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {UpdateCompanySettingsDto} from './dto/update-company-settings.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(somiteeId: number) {
    try {
      const settings = await this.prisma.companySettings.findUnique({
        where: {somiteeId},
      });
      if (!settings) {
        throw new NotFoundException('Company settings not found');
      }
      return settings;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('company.service.service.getSettings error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
        });
      } else {
        console.error('company.service.service.getSettings unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to getSettings');
    }
  }

  async updateSettings(somiteeId: number, dto: UpdateCompanySettingsDto) {
    try {
      const existing = await this.prisma.companySettings.findUnique({where: {somiteeId}});
      if (existing) {
        return this.prisma.companySettings.update({
          where: {somiteeId},
          data: dto,
        });
      }
      return this.prisma.companySettings.create({
        data: {
          somiteeId,
          ...dto,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('company.service.service.updateSettings error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          dto: dto,
        });
      } else {
        console.error('company.service.service.updateSettings unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to updateSettings');
    }
  }

  async uploadLogo(somiteeId: number, logoUrl: string) {
    try {
      return this.prisma.companySettings.upsert({
        where: {somiteeId},
        update: {logo: logoUrl},
        create: {somiteeId, name: '', logo: logoUrl},
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('company.service.service.uploadLogo error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          logoUrl: logoUrl,
        });
      } else {
        console.error('company.service.service.uploadLogo unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to uploadLogo');
    }
  }

  async uploadSignature(somiteeId: number, signatureUrl: string) {
    try {
      return this.prisma.companySettings.upsert({
        where: {somiteeId},
        update: {signature: signatureUrl},
        create: {somiteeId, name: '', signature: signatureUrl},
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('company.service.service.uploadSignature error:', {
          message: error.message,
          stack: error.stack,
          somiteeId: somiteeId,
          signatureUrl: signatureUrl,
        });
      } else {
        console.error('company.service.service.uploadSignature unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to uploadSignature');
    }
  }
}
