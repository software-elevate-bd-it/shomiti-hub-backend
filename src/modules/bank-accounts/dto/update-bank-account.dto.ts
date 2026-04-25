import {IsString, IsOptional, IsNumber, Min} from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';

export class UpdateBankAccountDto {
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
