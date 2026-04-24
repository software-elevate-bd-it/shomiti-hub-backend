import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString, IsNumber, IsDateString, IsPositive} from 'class-validator';

export class UpdateExpenseDto {
  @ApiPropertyOptional({example: 500})
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({example: '2026-04-24'})
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({example: 'Office Rent'})
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({example: 'cash'})
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({example: 'Updated note'})
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({example: 'approved'})
  @IsOptional()
  @IsString()
  status?: string;
}
