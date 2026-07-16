import { FeeWaterType } from '../enums/fee-water-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { PropertyType } from '../enums/property-type.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEnum(PropertyType)
  property_type?: PropertyType;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address_line1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address_line2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ward?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postal_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  rent_currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  internal_notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  zalo_group_link?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fee_electricity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fee_water?: string;

  @IsOptional()
  @IsEnum(FeeWaterType)
  fee_water_type?: FeeWaterType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fee_motorbike?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fee_car?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fee_wifi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fee_management?: string;

  @IsOptional()
  @IsUUID()
  created_by?: string;
}
