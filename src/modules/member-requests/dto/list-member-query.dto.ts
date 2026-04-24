import {Type} from 'class-transformer';
import {IsOptional, IsString, IsNumber} from 'class-validator';

export class ListMemberQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
