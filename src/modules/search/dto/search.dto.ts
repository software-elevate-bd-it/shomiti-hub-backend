import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class SearchDto {
  @ApiPropertyOptional({
    example: 'karim',
    description: 'Global search keyword',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
