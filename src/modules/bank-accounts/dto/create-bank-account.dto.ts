import {IsString, IsOptional, IsNumber, IsNotEmpty, IsEnum} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export enum AccountType {
  BANK = 'BANK',
  HAND_CASH = 'HAND_CASH',
}

export class CreateBankAccountDto {
  @ApiProperty({example: 'BANK'})
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType; // default BANK

  @ApiProperty({example: 'City Bank'})
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({example: 'Main Account'})
  @IsOptional()
  @IsString()
  accountName!: string;

  @ApiProperty({example: '1234567890'})
  @IsString()
  @IsOptional()
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
