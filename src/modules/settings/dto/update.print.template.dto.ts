import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsBoolean, IsOptional, IsString, IsNumber} from 'class-validator';

export class UpdatePrintTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showLogo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showCompanyName?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showSignature?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paperSize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orientation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  marginTop?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  marginBottom?: number;
}
