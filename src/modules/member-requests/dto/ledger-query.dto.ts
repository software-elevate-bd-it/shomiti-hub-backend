import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumberString} from 'class-validator';

export class LedgerQueryDto {
  @ApiPropertyOptional({example: '1'})
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({example: '20'})
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({example: '2026-01-01'})
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({example: '2026-12-31'})
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({example: 'credit'})
  @IsOptional()
  @IsString()
  type?: string;
}
