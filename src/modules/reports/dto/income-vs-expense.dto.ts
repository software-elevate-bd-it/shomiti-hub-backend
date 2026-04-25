import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class IncomeVsExpenseDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'End date filter (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    example: 'monthly',
    description: 'Group by: daily | monthly | yearly',
  })
  @IsOptional()
  @IsString()
  groupBy?: string;
}
