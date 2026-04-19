import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MemberQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Results per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
