import {IsString, IsOptional, IsNumber, IsObject} from 'class-validator';

export class CreateApprovalDto {
  @IsString()
  type!: 'collection' | 'expense' | 'bank' | 'member';

  @IsString()
  title!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  payload!: any;
}

export class ApproveRejectDto {
  @IsOptional()
  @IsString()
  note?: string;
}
