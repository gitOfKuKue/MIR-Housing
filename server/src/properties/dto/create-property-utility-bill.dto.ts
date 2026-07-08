import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { UtilityBillStatus } from '../enums/utility-bill-status.enum';
import { UtilityBillType } from '../enums/utility-bill-type.enum';

export class CreatePropertyUtilityBillDto {
  @IsEnum(UtilityBillType)
  bill_type: UtilityBillType;

  @IsDateString()
  billing_period_start: string;

  @IsDateString()
  billing_period_end: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsEnum(UtilityBillStatus)
  status?: UtilityBillStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  account_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
