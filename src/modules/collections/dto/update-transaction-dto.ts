import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsNumber, IsString} from 'class-validator';

export class UpdateTransactionDto {
  @ApiPropertyOptional({example: 500})
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({example: 'cash'})
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({example: 'monthly fee'})
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({example: 'TXN12345'})
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({example: 'Payment updated manually'})
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({example: 'pending'})
  @IsOptional()
  @IsString()
  status?: string;
}
