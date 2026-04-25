import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString, IsDateString, Min} from 'class-validator';

export class TransferDto {
  @ApiProperty({example: 2, description: 'Receiver bank account ID'})
  @IsNumber()
  toAccountId!: number;

  @ApiProperty({example: 5000, description: 'Transfer amount'})
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({
    example: '2026-04-25',
    description: 'Transfer date (optional)',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: 'Transfer for office fund',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 'REF12345',
  })
  @IsOptional()
  @IsString()
  reference?: string;
}
