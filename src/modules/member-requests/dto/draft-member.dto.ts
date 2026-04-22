import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Matches,
  IsIn
} from 'class-validator';

export class DraftMemberDto {
  // Personal Information - All optional for draft
  @ApiPropertyOptional({ example: 'করিম মিয়া', description: 'Name in Bengali' })
  @IsOptional()
  @IsString()
  nameBn?: string;

  @ApiPropertyOptional({ example: 'Karim Mia', description: 'Name in English' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'আব্দুল করিম', description: 'Father\'s name' })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional({ example: 'ফাতেমা বেগম', description: 'Mother\'s name' })
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional({ example: '1990-05-15', description: 'Date of birth' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ example: 'বাংলাদেশী', description: 'Nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'ইসলাম', description: 'Religion' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ example: 'B+', description: 'Blood group' })
  @IsOptional()
  @IsString()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodGroup?: string;

  // Contact Information
  @ApiPropertyOptional({ example: '01712345678', description: 'Mobile number' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+880|880|0)?1[3-9]\d{8}$/, { message: 'Valid Bangladesh mobile number required' })
  mobile?: string;

  @ApiPropertyOptional({ example: 'বানানী', description: 'Village' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: '5', description: 'Ward number' })
  @IsOptional()
  @IsString()
  wardNo?: string;

  @ApiPropertyOptional({ example: 'বানানী', description: 'Union' })
  @IsOptional()
  @IsString()
  union?: string;

  @ApiPropertyOptional({ example: 'গুলশান', description: 'Upazila' })
  @IsOptional()
  @IsString()
  upazila?: string;

  @ApiPropertyOptional({ example: 'ঢাকা', description: 'District' })
  @IsOptional()
  @IsString()
  district?: string;

  // Business Information
  @ApiPropertyOptional({ example: 'করিম ইলেকট্রনিক্স', description: 'Shop name' })
  @IsOptional()
  @IsString()
  shopName?: string;

  // Identification
  @ApiPropertyOptional({ example: '1234567890123', description: 'National ID number' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,17}$/, { message: 'NID must be 10-17 digits' })
  nid?: string;

  // Nominee Information
  @ApiPropertyOptional({ example: 'রহিমা বেগম', description: 'Nominee name' })
  @IsOptional()
  @IsString()
  nomineeName?: string;

  @ApiPropertyOptional({ example: 'স্ত্রী', description: 'Nominee relation' })
  @IsOptional()
  @IsString()
  nomineeRelation?: string;

  @ApiPropertyOptional({ example: '9876543210123', description: 'Nominee NID' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,17}$/, { message: 'Nominee NID must be 10-17 digits' })
  nomineeNid?: string;

  // Financial Information
  @ApiPropertyOptional({ example: 500, description: 'Monthly fee' })
  @IsOptional()
  @IsNumber()
  monthlyFee?: number;
}