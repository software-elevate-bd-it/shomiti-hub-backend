import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsArray, IsOptional, IsString} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Manager',
    description: 'Role name',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Manages members and payments',
    description: 'Short description of the role',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['member.create', 'member.view', 'payment.create', 'payment.view'],
    description: 'List of permissions assigned to the role',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}
