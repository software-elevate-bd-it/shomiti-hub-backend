import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsNumberString, IsString} from 'class-validator';

export class ListPaymentDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records per page',
  })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({
    example: 'approved',
    description: 'Payment status filter (pending, approved, rejected)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'cash',
    description: 'Payment method filter (cash, bank, mobile_banking)',
  })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({
    example: 101,
    description: 'Filter payments by member ID',
  })
  @IsOptional()
  @IsNumberString()
  memberId?: number;
}
