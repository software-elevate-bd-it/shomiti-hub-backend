import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsBoolean} from 'class-validator';

export class PrintTemplateDto {
  @ApiPropertyOptional({example: true, description: 'Show logo in print'})
  @IsOptional()
  @IsBoolean()
  showLogo?: boolean;

  @ApiPropertyOptional({example: true})
  @IsOptional()
  @IsBoolean()
  showCompanyName?: boolean;

  @ApiPropertyOptional({example: 'A4'})
  @IsOptional()
  paperSize?: string;

  @ApiPropertyOptional({example: 'portrait'})
  @IsOptional()
  orientation?: string;
}
