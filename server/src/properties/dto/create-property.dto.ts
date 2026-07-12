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
import { PropertyStatus } from '../enums/property-status.enum';
import { PropertyType } from '../enums/property-type.enum';
import {
  DryingAreaType,
  MainGateLockType,
  ParkingType,
  ToiletType,
} from '../enums/room-amenity.enum';

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
  @Min(0)
  area_sqm?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  room_type?: string;

  @IsOptional()
  @IsEnum(ToiletType)
  toilet_type?: ToiletType;

  @IsOptional()
  @IsEnum(ParkingType)
  parking_type?: ParkingType;

  @IsOptional()
  @IsEnum(MainGateLockType)
  main_gate_lock?: MainGateLockType;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_occupants?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_bikes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  floor?: string;

  @IsOptional()
  @IsEnum(DryingAreaType)
  drying_area?: DryingAreaType;

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
  @IsUUID()
  created_by?: string;
}
