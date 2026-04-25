import {ApiProperty} from '@nestjs/swagger';
import {IsNumber} from 'class-validator';

export class MarkNotificationReadDto {
  @ApiProperty({
    example: 1,
    description: 'Notification ID',
  })
  @IsNumber()
  id!: number;
}
