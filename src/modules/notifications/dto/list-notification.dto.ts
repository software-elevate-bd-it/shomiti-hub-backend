import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsBooleanString, IsOptional, IsNumberString} from 'class-validator';

export class ListNotificationDto {
  @ApiPropertyOptional({example: 1, description: 'Page number'})
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({example: 20, description: 'Items per page'})
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({example: true, description: 'Read status filter'})
  @IsOptional()
  @IsBooleanString()
  read?: string;
}
