import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumberString} from 'class-validator';

export class MemberDuesDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumberString()
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
