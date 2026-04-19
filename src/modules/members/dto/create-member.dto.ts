import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'John Doe Shop' })
  @IsNotEmpty()
  @IsString()
  shopName!: string;

  @ApiProperty({ example: '+8801234567890' })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'Dhaka, Bangladesh' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  nid!: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  monthlyFee!: number;

  @ApiPropertyOptional({ example: 'monthly' })
  @IsOptional()
  @IsString()
  billingCycle?: string;
}
