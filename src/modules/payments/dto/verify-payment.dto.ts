import {ApiProperty} from '@nestjs/swagger';
import {IsEnum, IsOptional, IsString} from 'class-validator';

export enum PaymentVerifyStatus {
  approved = 'approved',
  rejected = 'rejected',
  pending = 'pending',
}

export class VerifyPaymentDto {
  @ApiProperty({
    example: 'approved',
    enum: PaymentVerifyStatus,
    description: 'Payment verification status',
  })
  @IsEnum(PaymentVerifyStatus)
  status!: PaymentVerifyStatus;

  @ApiProperty({
    example: 'Verified by admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
