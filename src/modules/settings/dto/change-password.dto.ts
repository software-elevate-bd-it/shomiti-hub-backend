import {ApiProperty} from '@nestjs/swagger';
import {IsString, MinLength} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Current password of the user',
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
