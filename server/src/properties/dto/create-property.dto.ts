import { FeeWaterType } from '../enums/fee-water-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { PropertyType } from '../enums/property-type.enum';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
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
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rent_amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  rent_currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  area_sqm?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  room_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  floor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  deposit_months?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  holding_deposit?: number;

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
