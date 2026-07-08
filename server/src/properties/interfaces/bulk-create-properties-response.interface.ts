import { Property } from '../entities/property.entity';

export interface BulkCreatePropertiesResponse {
  data: Property[];
  meta: {
    created: number;
  };
}
