import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsNumberString} from 'class-validator';

export class MemberStatsDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Optional member/user filter (future use)',
  })
  @IsOptional()
  @IsNumberString()
  userId?: number;
}
