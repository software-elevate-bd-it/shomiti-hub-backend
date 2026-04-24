import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString, IsArray, ArrayNotEmpty} from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({example: 10001})
  @IsNumber()
  memberId!: number; // member REG NUMBER

  @ApiProperty({example: 500})
  @IsNumber()
  amount!: number;

  @ApiProperty({example: '2026-04-24'})
  @IsString()
  date!: string;

  @ApiProperty({example: 'cash'})
  @IsString()
  method!: string;

  @ApiPropertyOptional({example: 'Monthly Fee'})
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({example: 'TX123'})
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  // 🔥 MODE B
  @ApiPropertyOptional({example: '2025-2026'})
  @IsOptional()
  @IsString()
  financialYear?: string;

  @ApiPropertyOptional({example: [1, 2, 3]})
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  months?: number[];

  @ApiPropertyOptional({example: 0})
  @IsOptional()
  @IsNumber()
  lateFee?: number;

  @ApiPropertyOptional({example: 100})
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({example: 1900})
  @IsOptional()
  @IsNumber()
  totalPaid?: number;
}
