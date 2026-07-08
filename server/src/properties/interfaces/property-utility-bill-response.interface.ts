import { PropertyUtilityBill } from '../entities/property-utility-bill.entity';

export interface ListPropertyUtilityBillsResponse {
  data: PropertyUtilityBill[];
}

export interface DeletePropertyUtilityBillResponse {
  id: string;
  message: string;
}
