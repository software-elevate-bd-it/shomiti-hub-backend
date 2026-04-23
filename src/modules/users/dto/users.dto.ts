import {IsString, IsOptional, IsArray, IsEnum, IsBoolean} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(['member', 'main_user'])
  role!: 'member' | 'main_user';

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  roleIds?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(['member', 'main_user'])
  role?: 'member' | 'main_user';

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  roleIds?: string[];

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class ResetPasswordDto {
  // No body needed, generates new password
}
