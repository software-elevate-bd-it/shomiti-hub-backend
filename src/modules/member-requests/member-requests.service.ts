import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterMemberDto } from './dto/register-member.dto';
import { DraftMemberDto } from './dto/draft-member.dto';
import { UploadImagesDto } from './dto/upload-images.dto';
import { Express } from 'express';
import * as multer from 'multer';

@Injectable()
export class MemberRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterMemberDto, somiteeId?: string) {
    // Check if NID already exists
    const existingRequest = await this.prisma.memberRequest.findUnique({
      where: { nid: dto.nid }
    });

    if (existingRequest) {
      throw new BadRequestException('A registration request with this NID already exists');
    }

    // Check if mobile already exists
    const existingMobile = await this.prisma.memberRequest.findFirst({
      where: { mobile: dto.mobile }
    });

    if (existingMobile) {
      throw new BadRequestException('A registration request with this mobile number already exists');
    }

    // Generate member ID
    const memberId = await this.generateMemberId(somiteeId);

    const request = await this.prisma.memberRequest.create({
      data: {
        memberId,
        nameBn: dto.nameBn,
        nameEn: dto.nameEn,
        fatherName: dto.fatherName,
        motherName: dto.motherName,
        dob: new Date(dto.dob),
        nationality: dto.nationality,
        religion: dto.religion,
        bloodGroup: dto.bloodGroup,
        mobile: dto.mobile,
        village: dto.village,
        wardNo: dto.wardNo,
        union: dto.union,
        upazila: dto.upazila,
        district: dto.district,
        shopName: dto.shopName,
        nid: dto.nid,
        nomineeName: dto.nomineeName,
        nomineeRelation: dto.nomineeRelation,
        nomineeNid: dto.nomineeNid,
        monthlyFee: dto.monthlyFee,
        somiteeId: somiteeId || 'default-somitee-id',
        userId: 'system-user'
      }
    });

    return {
      success: true,
      statusCode: 201,
      message: 'Registration submitted. Pending admin approval.',
      data: {
        id: request.id,
        memberId: request.memberId,
        status: request.status,
        appliedAt: request.createdAt
      }
    };
  }

  async uploadImages(dto: UploadImagesDto, files: Express.Multer.File[], somiteeId: string) {
    // Find the registration request
    const request = await this.prisma.memberRequest.findFirst({
      where: { id: dto.registrationId, somiteeId }
    });

    if (!request) {
      throw new NotFoundException('Registration request not found');
    }

    // Validate required files
    const requiredFiles = ['profileImage', 'nidFront', 'nidBack', 'signature'];
    const uploadedFiles: Record<string, string> = {};

    for (const file of files) {
      if (requiredFiles.includes(file.fieldname)) {
        // TODO: Upload to cloud storage and get URLs
        // For now, we'll just store placeholder URLs
        const fileName = `${file.fieldname}-${dto.registrationId}.${file.mimetype.split('/')[1]}`;
        uploadedFiles[`${file.fieldname}Url`] = `https://cdn.somiteehq.com/members/${fileName}`;
      }
    }

    // Update the request with image URLs
    await this.prisma.memberRequest.update({
      where: { id: dto.registrationId },
      data: uploadedFiles
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Images uploaded',
      data: uploadedFiles
    };
  }

  async saveDraft(dto: DraftMemberDto, somiteeId?: string) {
    // For draft, we can create or update based on some identifier
    // For simplicity, we'll create a new draft each time
    // In a real app, you'd want to use session storage or a draft ID

    const draftData: any = {
      memberId: `DRAFT-${Date.now()}`, // Temporary ID for draft
      status: 'draft',
      somiteeId: somiteeId || 'default-somitee-id',
      userId: 'system-user'
    };

    // Only include provided fields
    if (dto.nameBn) draftData.nameBn = dto.nameBn;
    if (dto.nameEn) draftData.nameEn = dto.nameEn;
    if (dto.fatherName) draftData.fatherName = dto.fatherName;
    if (dto.motherName) draftData.motherName = dto.motherName;
    if (dto.dob) draftData.dob = new Date(dto.dob);
    if (dto.nationality) draftData.nationality = dto.nationality;
    if (dto.religion) draftData.religion = dto.religion;
    if (dto.bloodGroup) draftData.bloodGroup = dto.bloodGroup;
    if (dto.mobile) draftData.mobile = dto.mobile;
    if (dto.village) draftData.village = dto.village;
    if (dto.wardNo) draftData.wardNo = dto.wardNo;
    if (dto.union) draftData.union = dto.union;
    if (dto.upazila) draftData.upazila = dto.upazila;
    if (dto.district) draftData.district = dto.district;
    if (dto.shopName) draftData.shopName = dto.shopName;
    if (dto.nid) draftData.nid = dto.nid;
    if (dto.nomineeName) draftData.nomineeName = dto.nomineeName;
    if (dto.nomineeRelation) draftData.nomineeRelation = dto.nomineeRelation;
    if (dto.nomineeNid) draftData.nomineeNid = dto.nomineeNid;
    if (dto.monthlyFee) draftData.monthlyFee = dto.monthlyFee;

    const draft = await this.prisma.memberRequest.create({
      data: draftData
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Draft saved',
      data: {
        draftId: draft.id,
        savedAt: draft.createdAt
      }
    };
  }

  async list(somiteeId: string, page = 1, limit = 10) {
    const where = { somiteeId };
    const [data, total] = await Promise.all([
      this.prisma.memberRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.memberRequest.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async approve(id: string, somiteeId: string, body: any) {
    const request = await this.prisma.memberRequest.findFirst({ where: { id, somiteeId } });
    if (!request) {
      throw new NotFoundException('Member request not found');
    }

    // Create member from request
    const member = await this.prisma.member.create({
      data: {
        name: request.nameEn || request.nameBn,
        shopName: request.shopName,
        phone: request.mobile,
        address: `${request.village || ''}, ${request.union || ''}, ${request.upazila || ''}, ${request.district || ''}`.replace(/^, |, $/, ''),
        nid: request.nid,
        monthlyFee: request.monthlyFee,
        billingCycle: 'monthly',
        somiteeId: request.somiteeId,
        userId: request.userId
      }
    });

    // Update request status
    await this.prisma.memberRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: body.approvedBy || null
      }
    });

    return {
      requestId: request.id,
      memberId: member.id,
      status: 'approved',
      approvedAt: new Date()
    };
  }

  async reject(id: string, somiteeId: string, body: any) {
    const request = await this.prisma.memberRequest.findFirst({ where: { id, somiteeId } });
    if (!request) {
      throw new NotFoundException('Member request not found');
    }

    await this.prisma.memberRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionNote: body.rejectionNote
      }
    });

    return { id, status: 'rejected', rejectedAt: new Date() };
  }

  async remove(id: string, somiteeId: string) {
    const request = await this.prisma.memberRequest.findFirst({ where: { id, somiteeId } });
    if (!request) {
      throw new NotFoundException('Member request not found');
    }

    await this.prisma.memberRequest.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async generateMemberId(somiteeId?: string): Promise<string> {
    // Generate a unique member ID like MEM-ABC123
    const prefix = 'MEM';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  }
}
