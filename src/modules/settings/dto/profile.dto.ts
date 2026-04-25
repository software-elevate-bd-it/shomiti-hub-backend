import {ApiProperty} from '@nestjs/swagger';
import {IsNumber} from 'class-validator';

export class ProfileDto {
  @ApiProperty({example: 1})
  @IsNumber()
  userId!: number;
}
