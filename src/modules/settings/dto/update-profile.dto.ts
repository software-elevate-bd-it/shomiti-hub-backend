import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({example: 'John Doe'})
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({example: '017XXXXXXXX'})
  @IsOptional()
  @IsString()
  phone?: string;

//   @ApiPropertyOptional({example: 'john@email.com'})
//   @IsOptional()
//   @IsString()
//   email?: string;
}
