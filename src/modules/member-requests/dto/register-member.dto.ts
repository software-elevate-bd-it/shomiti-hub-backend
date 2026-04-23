import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Matches,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class RegisterMemberDto {
  // Personal Information
  @ApiProperty({example: 'করিম মিয়া', description: 'Name in Bengali'})
  @IsNotEmpty()
  @IsString()
  nameBn!: string;

  @ApiProperty({example: 'Karim Mia', description: 'Name in English'})
  @IsNotEmpty()
  @IsString()
  nameEn!: string;

  @ApiProperty({example: 'আব্দুল করিম', description: "Father's name"})
  @IsNotEmpty()
  @IsString()
  fatherName!: string;

  @ApiProperty({example: 'ফাতেমা বেগম', description: "Mother's name"})
  @IsNotEmpty()
  @IsString()
  motherName!: string;

  @ApiProperty({example: '1990-05-15', description: 'Date of birth'})
  @IsNotEmpty()
  @IsDateString()
  dob!: string;

  @ApiProperty({example: 'বাংলাদেশী', description: 'Nationality'})
  @IsNotEmpty()
  @IsString()
  nationality!: string;

  @ApiProperty({example: 'ইসলাম', description: 'Religion'})
  @IsNotEmpty()
  @IsString()
  religion!: string;

  @ApiProperty({example: 'B+', description: 'Blood group'})
  @IsNotEmpty()
  @IsString()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodGroup!: string;

  // Contact Information
  @ApiProperty({example: '01712345678', description: 'Mobile number'})
  @IsNotEmpty()
  @IsString()
  @Matches(/^(\+880|880|0)1[3-9]\d{8}$/, {message: 'Valid Bangladesh mobile number required'})
  mobile!: string;

  @ApiPropertyOptional({example: 'বানানী', description: 'Village'})
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({example: '5', description: 'Ward number'})
  @IsOptional()
  @IsString()
  wardNo?: string;

  @ApiPropertyOptional({example: 'বানানী', description: 'Union'})
  @IsOptional()
  @IsString()
  union?: string;

  @ApiPropertyOptional({example: 'গুলশান', description: 'Upazila'})
  @IsOptional()
  @IsString()
  upazila?: string;

  @ApiPropertyOptional({example: 'ঢাকা', description: 'District'})
  @IsOptional()
  @IsString()
  district?: string;

  // Business Information
  @ApiProperty({example: 'করিম ইলেকট্রনিক্স', description: 'Shop name'})
  @IsNotEmpty()
  @IsString()
  shopName!: string;

  // Identification
  @ApiProperty({example: '1234567890123', description: 'National ID number'})
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,17}$/, {message: 'NID must be 10-17 digits'})
  nid!: string;

  // Nominee Information
  @ApiProperty({example: 'রহিমা বেগম', description: 'Nominee name'})
  @IsNotEmpty()
  @IsString()
  nomineeName!: string;

  @ApiProperty({example: 'স্ত্রী', description: 'Nominee relation'})
  @IsNotEmpty()
  @IsString()
  nomineeRelation!: string;

  @ApiProperty({example: '9876543210123', description: 'Nominee NID'})
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10,17}$/, {message: 'Nominee NID must be 10-17 digits'})
  nomineeNid!: string;

  // Financial Information
  @ApiProperty({example: 500, description: 'Monthly fee'})
  @IsNotEmpty()
  @IsNumber()
  monthlyFee!: number;
}
