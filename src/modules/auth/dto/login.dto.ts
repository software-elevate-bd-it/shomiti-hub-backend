import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';

export class LoginDto {
  @ApiProperty({example: 'admin@somitee.dev'})
  @IsEmail()
  email!: string;

  @ApiProperty({example: '123456', minLength: 6})
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
