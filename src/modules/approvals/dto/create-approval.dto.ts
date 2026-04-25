import {ApiProperty} from '@nestjs/swagger';
import {IsEnum, IsNumber, IsOptional, IsString, IsObject} from 'class-validator';

export enum ApprovalType {
  collection = 'collection',
  expense = 'expense',
  bank = 'bank',
  member = 'member',
}

export class CreateApprovalDto {
  @ApiProperty({
    enum: ApprovalType,
    example: ApprovalType.collection,
  })
  @IsEnum(ApprovalType)
  type!: ApprovalType;

  @ApiProperty({
    example: 'Monthly Collection Approval',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    required: false,
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    required: false,
    example: 'Need approval for monthly collection',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: {
      memberId: 1,
      month: '2026-01',
    },
  })
  @IsObject()
  payload!: Record<string, any>;
}
