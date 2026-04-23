import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsEnum, IsNumber, IsOptional, IsString} from 'class-validator';
import {MemberStatus} from '@prisma/client';

export class UpdateMemberDto {
  @ApiPropertyOptional({example: 'John Doe'})
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({example: 'John Doe Shop'})
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiPropertyOptional({example: '+8801234567890'})
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({example: 'Dhaka, Bangladesh'})
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({example: 'active', enum: MemberStatus})
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({example: 500})
  @IsOptional()
  @IsNumber()
  monthlyFee?: number;
}
