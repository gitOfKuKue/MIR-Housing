import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AmenityFilter } from '../enums/amenity-filter.enum';
import { FurnishingFilter } from '../enums/furnishing-filter.enum';
import { PropertyStatus } from '../enums/property-status.enum';

export class UpsertRoomDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  room_type?: string | null;

  @IsOptional()
  @IsString()
  floor?: string | null;

  @IsOptional()
  @IsNumber()
  area_sqm?: number | null;

  @IsOptional()
  @IsNumber()
  rent_amount?: number | null;

  @IsOptional()
  @IsString()
  rent_currency?: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsNumber()
  holding_deposit?: number | null;

  @IsOptional()
  @IsNumber()
  deposit_months?: number | null;

  @IsOptional()
  @IsNumber()
  bedrooms?: number | null;

  @IsOptional()
  @IsNumber()
  bathrooms?: number | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsArray()
  @IsEnum(FurnishingFilter, { each: true })
  furnishings?: FurnishingFilter[];
}

export class UpsertPropertyFurnishingsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(AmenityFilter, { each: true })
  amenities?: AmenityFilter[];

  /** @deprecated Prefer `rooms`. Applied to the first room when `rooms` is omitted. */
  @IsOptional()
  @IsArray()
  @IsEnum(FurnishingFilter, { each: true })
  furnishings?: FurnishingFilter[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertRoomDto)
  rooms?: UpsertRoomDto[];
}
