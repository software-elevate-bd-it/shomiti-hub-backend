import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsNumberString, IsString} from 'class-validator';

export class CollectionReportDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({example: '2026-01-01'})
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({example: '2026-12-31'})
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({example: 'approved'})
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({example: 'cash'})
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({example: '1'})
  @IsOptional()
  @IsNumberString()
  memberId?: number;
}
