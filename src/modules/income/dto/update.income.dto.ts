import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumber, IsDateString, IsPositive, IsEnum} from 'class-validator';

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

export class UpdateIncomeDto {
  @ApiPropertyOptional({
    example: 'FDR Interest January',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    enum: IncomeType,
    example: 'fixed_deposit_interest',
  })
  @IsOptional()
  @IsEnum(IncomeType)
  type?: IncomeType;

  @ApiPropertyOptional({
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    example: '2026-04-24',
  })
  @IsOptional()
  @IsDateString()
  incomeDate?: string;

  @ApiPropertyOptional({
    example: 'Dutch Bangla Bank',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: 'FDR-2026-001',
  })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional({
    example: 'Updated income description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Updated note',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  bankAccountId?: number;

  @ApiPropertyOptional({
    enum: IncomeStatus,
    example: 'received',
  })
  @IsOptional()
  @IsEnum(IncomeStatus)
  status?: IncomeStatus;
}
