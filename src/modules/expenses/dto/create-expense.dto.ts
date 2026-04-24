import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString, IsDateString, IsPositive} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({example: 500})
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({example: '2026-04-24'})
  @IsDateString()
  date!: string;

  @ApiProperty({example: 'Office Rent'})
  @IsString()
  category!: string;

  @ApiProperty({example: 'cash'})
  @IsString()
  method!: string;

  @ApiProperty({example: 'Monthly office rent'})
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({example: 'https://receipt.url/file.png'})
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({example: 'approved', required: false})
  @IsOptional()
  @IsString()
  status?: string;
}
