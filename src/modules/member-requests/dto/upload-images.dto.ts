import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';

export class UploadImagesDto {
  @ApiProperty({example: 'mr-uuid', description: 'Registration ID'})
  @IsNotEmpty()
  @IsString()
  registrationId!: number;
}
