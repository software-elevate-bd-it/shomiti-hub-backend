import {IsString, IsOptional, IsNumber, IsNotEmpty} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({example: 'City Bank'})
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({example: 'Main Account'})
  @IsString()
  @IsNotEmpty()
  accountName!: string;

  @ApiProperty({example: '1234567890'})
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({example: 0, required: false})
  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @ApiProperty({example: 0, required: false})
  @IsOptional()
  @IsNumber()
  balance?: number;
}
