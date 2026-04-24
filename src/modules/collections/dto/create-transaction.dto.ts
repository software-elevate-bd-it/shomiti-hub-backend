import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsNotEmpty, IsOptional, IsString, IsNumber} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({example: 10001})
  @IsNotEmpty()
  @IsNumber()
  memberRegNumber!: number;

  @ApiProperty({example: 500})
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

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

  @ApiPropertyOptional({example: 'note here'})
  @IsOptional()
  @IsString()
  note?: string;
}
