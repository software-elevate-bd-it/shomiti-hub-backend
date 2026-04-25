import {IsString, IsOptional, IsArray, IsEnum, IsBoolean} from 'class-validator';

import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsString()
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'User login password',
  })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    example: '+8801712345678',
    description: 'Phone number (optional)',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'member',
    enum: ['member', 'main_user'],
    description: 'User role type',
  })
  @IsEnum(['member', 'main_user'])
  role!: 'member' | 'main_user';

  @ApiPropertyOptional({
    example: ['1', '2'],
    description: 'Assigned role IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({each: true})
  roleIds?: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '+8801712345678',
    description: 'Phone number (optional)',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'StrongPassword123',
    description: 'User login password',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: 'member',
    enum: ['member', 'main_user'],
    description: 'User role type',
  })
  @IsOptional()
  @IsEnum(['member', 'main_user'])
  role?: 'member' | 'main_user';

  @ApiPropertyOptional({
    example: ['1', '2'],
    description: 'Assigned role IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({each: true})
  roleIds?: string[];

  @ApiPropertyOptional({
    example: 'active',
    enum: ['active', 'inactive'],
    description: 'User status',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class ResetPasswordDto {
  // No body needed, generates new password
}
