import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export enum ApprovalAction {
  approved = 'approved',
  rejected = 'rejected',
}

export class ApproveRejectDto {
  @ApiProperty({
    example: 'approved',
    enum: ApprovalAction,
    description: 'Approval status (approved or rejected)',
  })
  status!: ApprovalAction;

  @ApiPropertyOptional({
    example: 'Verified and approved by admin',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
