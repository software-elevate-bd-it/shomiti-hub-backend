import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumberString, IsEnum} from 'class-validator';

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

export class ListIncomeQueryDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumberString()
  limit?: string;

  // 🔥 SMART SEARCH
  @ApiPropertyOptional({
    example: 'FDR / donation / DBBL / REF123',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: IncomeType,
    example: 'fixed_deposit_interest',
  })
  @IsOptional()
  @IsEnum(IncomeType)
  type?: IncomeType;

  @ApiPropertyOptional({
    enum: IncomeStatus,
    example: 'received',
  })
  @IsOptional()
  @IsEnum(IncomeStatus)
  status?: IncomeStatus;

  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by bank account ID',
  })
  @IsOptional()
  @IsNumberString()
  bankAccountId?: string;
}
