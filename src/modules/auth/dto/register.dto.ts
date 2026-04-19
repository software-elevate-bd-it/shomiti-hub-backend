import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: '+8801234567890' })
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Somitee Shop' })
  @IsNotEmpty()
  somiteeName!: string;
}
