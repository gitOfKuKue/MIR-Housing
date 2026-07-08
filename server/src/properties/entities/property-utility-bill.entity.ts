import { UtilityBillStatus } from '../enums/utility-bill-status.enum';
import { UtilityBillType } from '../enums/utility-bill-type.enum';

export interface PropertyUtilityBill {
  id: string;
  property_id: string;
  bill_type: UtilityBillType;
  billing_period_start: string;
  billing_period_end: string;
  amount: number;
  currency: string;
  due_date: string | null;
  paid_at: string | null;
  status: UtilityBillStatus;
  provider_name: string | null;
  account_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
