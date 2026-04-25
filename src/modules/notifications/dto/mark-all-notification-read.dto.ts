import {ApiProperty} from '@nestjs/swagger';

export class MarkAllNotificationReadDto {
  @ApiProperty({
    example: true,
    description: 'Optional flag (always true for mark all read)',
  })
  read!: boolean;
}
