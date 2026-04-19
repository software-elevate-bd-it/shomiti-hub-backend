import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class AssignRoleDto {
  @IsString()
  userId!: string;

  @IsString()
  userName!: string;

  @IsString()
  roleId!: string;
}

export class RemoveRoleDto {
  @IsString()
  userId!: string;

  @IsString()
  roleId!: string;
}