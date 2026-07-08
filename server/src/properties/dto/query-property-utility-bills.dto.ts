import { IsEnum, IsOptional } from 'class-validator';
import { UtilityBillStatus } from '../enums/utility-bill-status.enum';
import { UtilityBillType } from '../enums/utility-bill-type.enum';

export class QueryPropertyUtilityBillsDto {
  @IsOptional()
  @IsEnum(UtilityBillType)
  bill_type?: UtilityBillType;

  @IsOptional()
  @IsEnum(UtilityBillStatus)
  status?: UtilityBillStatus;
}
