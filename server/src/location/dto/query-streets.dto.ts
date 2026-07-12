import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class QueryStreetsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  ward: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  district: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
