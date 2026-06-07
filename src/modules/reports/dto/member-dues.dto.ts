import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumber} from 'class-validator';

export class MemberDuesDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filter by member status',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'karim',
    description: 'Search by member name / phone',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
