import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsEnum, IsOptional} from 'class-validator';

export enum ApprovalType {
  collection = 'collection',
  expense = 'expense',
  bank = 'bank',
  member = 'member',
}

export class GetApprovalsDto {
  @ApiPropertyOptional({example: 'pending'})
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: 'collection',
    enum: ApprovalType,
  })
  @IsOptional()
  @IsEnum(ApprovalType)
  type?: ApprovalType;

  @ApiPropertyOptional({example: 1})
  @IsOptional()
  createdBy?: number;

  @ApiPropertyOptional({example: 1})
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({example: 20})
  @IsOptional()
  limit?: number;
}
