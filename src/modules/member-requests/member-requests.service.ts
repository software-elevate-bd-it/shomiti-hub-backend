import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {RegisterMemberDto} from './dto/register-member.dto';
import {DraftMemberDto} from './dto/draft-member.dto';
import {UploadImagesDto} from './dto/upload-images.dto';
import {Express} from 'express';
import * as multer from 'multer';

@Injectable()
export class MemberRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterMemberDto, userId: number, somiteeId: number) {
    try {
      // Check if NID already exists
      const existingRequest = await this.prisma.memberRequest.findUnique({
        where: {nid: dto.nid},
      });

      if (existingRequest) {
        throw new BadRequestException('A registration request with this NID already exists');
      }

      // Check if mobile already exists
      const existingMobile = await this.prisma.memberRequest.findFirst({
        where: {mobile: dto.mobile},
      });

      if (existingMobile) {
        throw new BadRequestException(
          'A registration request with this mobile number already exists',
        );
      }

      const request = await this.prisma.memberRequest.create({
        data: {
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
          somiteeId,
          createdById: userId,
        },
      });

      return {
        success: true,
        statusCode: 201,
        message: 'Registration submitted. Pending admin approval.',
        data: {
          id: request.id,
          status: request.status,
          appliedAt: request.createdAt,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('member-requests.service.register error:', {
          message: error.message,
          stack: error.stack,
          dto,
          somiteeId,
          userId,
        });
      } else {
        console.error('member-requests.service.register unknown error:', error);
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

  async uploadImages(
    dto: UploadImagesDto,
    files: Express.Multer.File[],
    userId: number,
    somiteeId: number,
  ) {
    try {
      const registrationId = Number(dto.registrationId);

      // Find the registration request
      const request = await this.prisma.memberRequest.findFirst({
        where: {id: registrationId, somiteeId},
      });

      if (!request) {
        throw new NotFoundException('Registration request not found');
      }

      // Validate required files
      const requiredFiles = ['profileImage', 'nidFront', 'nidBack', 'signature'];
      const uploadedFiles: Record<string, string> = {};

      for (const file of files) {
        if (requiredFiles.includes(file.fieldname)) {
          const fileName = `${file.fieldname}-${registrationId}.${file.mimetype.split('/')[1]}`;
          uploadedFiles[`${file.fieldname}Url`] = `https://cdn.somiteehq.com/members/${fileName}`;
        }
      }

      // Update the request with image URLs
      await this.prisma.memberRequest.update({
        where: {id: registrationId},
        data: {
          ...uploadedFiles,
          updatedById: userId,
        },
      });

      return {
        success: true,
        statusCode: 200,
        message: 'Images uploaded',
        data: uploadedFiles,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('member-requests.service.uploadImages error:', {
          message: error.message,
          stack: error.stack,
          dto,
          files,
          somiteeId,
        });
      } else {
        console.error('member-requests.service.uploadImages unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to upload images');
    }
  }

  async saveDraft(dto: DraftMemberDto, userId: number, somiteeId: number) {
    try {
      const draftData: any = {
        status: 'draft',
        somiteeId,
        createdById: userId,
      };

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
        data: draftData,
      });

      return {
        success: true,
        statusCode: 200,
        message: 'Draft saved',
        data: {
          draftId: draft.id,
          savedAt: draft.createdAt,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('member-requests.service.saveDraft error:', {
          message: error.message,
          stack: error.stack,
          dto,
          somiteeId,
          userId,
        });
      } else {
        console.error('member-requests.service.saveDraft unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to save draft');
    }
  }

  async list(somiteeId: number, page = 1, limit = 10) {
    try {
      const where = {somiteeId};
      const [data, total] = await Promise.all([
        this.prisma.memberRequest.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {createdAt: 'desc'},
        }),
        this.prisma.memberRequest.count({where}),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('member-requests.service.list error:', {
          message: error.message,
          stack: error.stack,
          somiteeId,
          page,
          limit,
        });
      } else {
        console.error('member-requests.service.list unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to list');
    }
  }

  async approve(id: number | string, userId: number, somiteeId: number, body: any) {
    try {
      const requestId = Number(id);
      const request = await this.prisma.memberRequest.findFirst({
        where: {id: requestId, somiteeId},
      });
      if (!request) {
        throw new NotFoundException('Member request not found');
      }

      const member = await this.prisma.member.create({
        data: {
          name: request.nameEn || request.nameBn,
          shopName: request.shopName,
          phone: request.mobile,
          address:
            `${request.village || ''}, ${request.union || ''}, ${request.upazila || ''}, ${request.district || ''}`.replace(
              /^, |, $/,
              '',
            ),
          nid: request.nid,
          monthlyFee: request.monthlyFee,
          billingCycle: request.billingCycle,
          somiteeId: request.somiteeId,
          createdById: userId,
        },
      });

      await this.prisma.memberRequest.update({
        where: {id: requestId},
        data: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: userId,
        },
      });

      return {
        requestId: request.id,
        memberId: member.id,
        status: 'approved',
        approvedAt: new Date(),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('member-requests.service.approve error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
          body,
        });
      } else {
        console.error('member-requests.service.approve unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to approve');
    }
  }

  async reject(id: number | string, userId: number, somiteeId: number, body: any) {
    try {
      const requestId = Number(id);
      const request = await this.prisma.memberRequest.findFirst({
        where: {id: requestId, somiteeId},
      });
      if (!request) {
        throw new NotFoundException('Member request not found');
      }

      await this.prisma.memberRequest.update({
        where: {id: requestId},
        data: {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectionNote: body.rejectionNote,
        },
      });

      return {id: requestId, status: 'rejected', rejectedAt: new Date()};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('member-requests.service.reject error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
          body,
        });
      } else {
        console.error('member-requests.service.reject unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to reject');
    }
  }

  async remove(id: number | string, somiteeId: number) {
    try {
      const requestId = Number(id);
      const request = await this.prisma.memberRequest.findFirst({
        where: {id: requestId, somiteeId},
      });
      if (!request) {
        throw new NotFoundException('Member request not found');
      }

      await this.prisma.memberRequest.delete({where: {id: requestId}});
      return {id: requestId, deleted: true};
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('member-requests.service.remove error:', {
          message: error.message,
          stack: error.stack,
          id,
          somiteeId,
        });
      } else {
        console.error('member-requests.service.remove unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove');
    }
  }
}
