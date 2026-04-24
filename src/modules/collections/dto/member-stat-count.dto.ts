import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';

export class MemberStatCountDto {
  @ApiProperty({
    example: 10001,
    description: 'Member Registration Number (NOT database ID)',
  })
  @IsNumber()
  memberRegNumber!: number;

  @ApiProperty({
    example: '2025-2026',
    description: 'Financial Year',
  })
  @IsString()
  financialYear!: string;
}
