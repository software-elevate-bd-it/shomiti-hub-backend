import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

export class ApproveMemberRequestDto {
  @ApiPropertyOptional({
    example: 'Verified all documents, approved',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 'manual approval',
  })
  @IsOptional()
  @IsString()
  actionType?: string;
}
