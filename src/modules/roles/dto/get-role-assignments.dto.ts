import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsNumberString, IsOptional} from 'class-validator';

export class GetRoleAssignmentsDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsNumberString()
  userId?: number;

  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({example: 20})
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
