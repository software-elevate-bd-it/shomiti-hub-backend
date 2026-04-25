import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class ListRoleDto {
  @ApiPropertyOptional({
    example: 'admin',
    description: 'Optional role name filter',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
