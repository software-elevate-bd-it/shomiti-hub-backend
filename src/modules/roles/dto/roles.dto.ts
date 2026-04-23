import {IsString, IsOptional, IsArray, IsBoolean} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
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
  @IsString({each: true})
  permissions?: string[];
}

export class AssignRoleDto {
  @IsString()
  userId!: number;

  @IsString()
  userName!: string;

  @IsString()
  roleId!: number;
}

export class RemoveRoleDto {
  @IsString()
  userId!: number;

  @IsString()
  roleId!: number;
}
