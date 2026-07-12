import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { AmenityFilter } from '../enums/amenity-filter.enum';
import { FurnishingFilter } from '../enums/furnishing-filter.enum';

export class UpsertPropertyFurnishingsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(AmenityFilter, { each: true })
  amenities?: AmenityFilter[];

  @IsOptional()
  @IsArray()
  @IsEnum(FurnishingFilter, { each: true })
  furnishings?: FurnishingFilter[];
}
