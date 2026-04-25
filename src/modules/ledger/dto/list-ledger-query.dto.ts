import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumberString} from 'class-validator';

export class ListLedgerQueryDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({example: 20})
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({example: 'collection'})
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({example: 'karim'})
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({example: 10001})
  @IsOptional()
  @IsNumberString()
  memberId?: string;

  @ApiPropertyOptional({example: '2025-01-01'})
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({example: '2025-12-31'})
  @IsOptional()
  @IsString()
  dateTo?: string;
}
