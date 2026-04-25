import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsNumberString, IsString} from 'class-validator';

export class ListActivityLogDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({example: 20})
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({example: 'CREATE_MEMBER'})
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  userId?: number;

  @ApiPropertyOptional({example: '2026-01-01'})
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({example: '2026-12-31'})
  @IsOptional()
  @IsString()
  dateTo?: string;
}
