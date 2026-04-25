import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class CashFlowDto {
  @ApiPropertyOptional({example: '2026-01-01'})
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({example: '2026-12-31'})
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({example: 'daily'})
  @IsOptional()
  @IsString()
  groupBy?: 'daily' | 'monthly';
}
