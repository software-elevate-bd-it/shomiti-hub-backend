import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class RejectMemberRequestDto {
  @ApiPropertyOptional({
    example: 'Documents are invalid / mismatch NID',
  })
  @IsOptional()
  @IsString()
  rejectionNote?: string;
}
