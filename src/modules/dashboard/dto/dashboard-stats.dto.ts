import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class DashboardStatsDto {
  @ApiPropertyOptional({
    example: '2026-04-25',
    description: 'Filter by date (optional future use)',
  })
  @IsOptional()
  @IsString()
  date?: string;
}
