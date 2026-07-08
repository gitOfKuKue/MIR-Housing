import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyUtilityBillDto } from './create-property-utility-bill.dto';

export class UpdatePropertyUtilityBillDto extends PartialType(
  CreatePropertyUtilityBillDto,
) {}
