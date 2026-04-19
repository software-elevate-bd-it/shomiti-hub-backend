import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(somiteeId: string) {
    const settings = await this.prisma.companySettings.findUnique({
      where: { somiteeId }
    });
    if (!settings) {
      throw new NotFoundException('Company settings not found');
    }
    return settings;
  }

  async updateSettings(somiteeId: string, dto: UpdateCompanySettingsDto) {
    const existing = await this.prisma.companySettings.findUnique({ where: { somiteeId } });
    if (existing) {
      return this.prisma.companySettings.update({
        where: { somiteeId },
        data: dto
      });
    }
    return this.prisma.companySettings.create({
      data: {
        somiteeId,
        ...dto
      }
    });
  }

  async uploadLogo(somiteeId: string, logoUrl: string) {
    return this.prisma.companySettings.upsert({
      where: { somiteeId },
      update: { logo: logoUrl },
      create: { somiteeId, name: '', logo: logoUrl }
    });
  }

  async uploadSignature(somiteeId: string, signatureUrl: string) {
    return this.prisma.companySettings.upsert({
      where: { somiteeId },
      update: { signature: signatureUrl },
      create: { somiteeId, name: '', signature: signatureUrl }
    });
  }
}
