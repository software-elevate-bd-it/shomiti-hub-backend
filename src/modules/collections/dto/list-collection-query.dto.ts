import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumberString, IsIn} from 'class-validator';

export class ListCollectionQueryDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumberString()
  limit?: string;

  // 🔍 search by member name / transactionId
  @ApiPropertyOptional({example: 'karim'})
  @IsOptional()
  @IsString()
  search?: string;

  // ✅ align with Payment.status (pending / paid / approved etc.)
  @ApiPropertyOptional({example: 'paid'})
  @IsOptional()
  @IsString()
  status?: string;

  // 💳 payment method
  @ApiPropertyOptional({example: 'bkash'})
  @IsOptional()
  @IsString()
  @IsIn(['cash', 'bkash', 'nagad', 'bank', 'sslcommerz'])
  method?: string;

  // 📂 category (optional now, mostly legacy)
  @ApiPropertyOptional({example: 'Monthly Fee'})
  @IsOptional()
  @IsString()
  category?: string;

  // 🔑 MEMBER REG NUMBER (not DB id)
  @ApiPropertyOptional({
    example: 10001,
    description: 'Member Registration Number',
  })
  @IsOptional()
  @IsNumberString()
  memberId?: string;

  // 📅 financial year (NEW — important for your system)
  @ApiPropertyOptional({
    example: '2025-2026',
    description: 'Filter by financial year',
  })
  @IsOptional()
  @IsString()
  financialYear?: string;

  // 📆 date range
  @ApiPropertyOptional({example: '2025-01-01'})
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({example: '2025-12-31'})
  @IsOptional()
  @IsString()
  dateTo?: string;
}
