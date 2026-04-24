import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumberString} from 'class-validator';

export class ListExpenseQueryDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumberString()
  limit?: string;

  // 🔥 SINGLE SMART SEARCH FIELD
  @ApiPropertyOptional({example: 'karim / TXN123 / 10001'})
  @IsOptional()
  @IsString()
  search?: string;
}
