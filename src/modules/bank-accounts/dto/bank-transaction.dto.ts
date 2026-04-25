import {IsNumber, IsOptional, IsString, IsDateString, Min} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class BankTransactionDto {
  @ApiProperty({example: 5000})
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({example: '2026-04-25'})
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({example: 'Deposit from cash'})
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({example: 'TXN123'})
  @IsOptional()
  @IsString()
  reference?: string;
}
