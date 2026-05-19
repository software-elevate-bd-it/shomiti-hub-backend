import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString, IsDateString, IsPositive, IsEnum} from 'class-validator';

export enum IncomeType {
  FIXED_DEPOSIT_INTEREST = 'fixed_deposit_interest',
  BANK_INTEREST = 'bank_interest',
  DONATION = 'donation',
  INVESTMENT_PROFIT = 'investment_profit',
  OFFICE_RENT = 'office_rent',
  SERVICE_CHARGE = 'service_charge',
  LATE_FEE = 'late_fee',
  REGISTRATION_FEE = 'registration_fee',
  OTHER = 'other',
}

export enum IncomeStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export class CreateIncomeDto {
  @ApiProperty({
    example: 'FDR Interest January',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'fixed_deposit_interest',
    enum: IncomeType,
  })
  @IsEnum(IncomeType)
  type!: IncomeType;

  @ApiProperty({
    example: 5000,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({
    example: '2026-04-24',
  })
  @IsDateString()
  incomeDate!: string;

  @ApiProperty({
    example: 'Dutch Bangla Bank FDR',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    example: 'FDR-2026-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiProperty({
    example: 'Interest received from fixed deposit',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bankAccountId?: number;

  @ApiProperty({
    example: 'received',
    enum: IncomeStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(IncomeStatus)
  status?: IncomeStatus;
}
