import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumberString} from 'class-validator';

export class ListBankAccountDto {
  @ApiPropertyOptional({example: 1})
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({example: 10})
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({example: 'sonali'})
  @IsOptional()
  @IsString()
  search?: string;
}
