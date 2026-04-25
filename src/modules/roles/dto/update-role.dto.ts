import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsArray, IsOptional, IsString} from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({example: 'Manager'})
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({example: 'Updated description'})
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['member.view', 'payment.create'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}
