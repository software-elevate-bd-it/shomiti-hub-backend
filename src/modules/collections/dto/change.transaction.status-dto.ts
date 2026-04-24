import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional} from 'class-validator';

export class ChangeTransactionStatusDto {
  @ApiProperty({example: 'approved'})
  @IsString()
  status!: string;

  @ApiProperty({example: 'Approved by admin', required: false})
  @IsOptional()
  @IsString()
  note?: string;
}
