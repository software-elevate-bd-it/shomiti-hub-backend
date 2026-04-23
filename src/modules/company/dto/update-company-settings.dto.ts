import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class UpdateCompanySettingsDto {
  @ApiPropertyOptional({example: 'Somitee Shop'})
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({example: 'https://example.com/logo.png'})
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({example: 'Dhaka, Bangladesh'})
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({example: '+8801234567890'})
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({example: 'hello@somitee.com'})
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({example: 'Jane Doe'})
  @IsOptional()
  @IsString()
  signature?: string;
}
