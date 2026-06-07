import {IsString, IsOptional, IsNumber, Min, IsEnum} from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';

export enum AccountType {
  BANK = 'BANK',
  HAND_CASH = 'HAND_CASH',
}

export class UpdateBankAccountDto {
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType; // default BANK

  @ApiPropertyOptional({example: 'City Bank'})
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({example: 'Main Account'})
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({example: '1234567890'})
  @IsOptional()
  @IsString()
  accountNumber?: string;

  // ⚠️ IMPORTANT: never freely update balance in accounting system
  @ApiPropertyOptional({example: 10000})
  @IsOptional()
  @IsNumber()
  @Min(0)
  openingBalance?: number;
}
