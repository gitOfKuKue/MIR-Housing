import { Property } from './property.entity';
import { PropertyFurnishings } from './property-furnishings.entity';
import { PropertyImage } from './property-image.entity';
import { PropertyUtilityBill } from './property-utility-bill.entity';

export interface PropertyImageWithUrl extends PropertyImage {
  public_url: string;
}

export interface PropertyWithImages extends Property {
  images: PropertyImageWithUrl[];
  utility_bills: PropertyUtilityBill[];
  furnishings: PropertyFurnishings | null;
}

interface PropertyRowWithRelations extends Property {
  images?: PropertyImage[] | null;
  property_images?: PropertyImage[] | null;
  utility_bills?: PropertyUtilityBill[] | null;
  property_utility_bills?: PropertyUtilityBill[] | null;
  furnishings?: PropertyFurnishings | PropertyFurnishings[] | null;
  property_furnishings?: PropertyFurnishings | PropertyFurnishings[] | null;
}

function resolveFurnishings(
  row: PropertyRowWithRelations,
): PropertyFurnishings | null {
  const furnishings = row.furnishings ?? row.property_furnishings ?? null;

  if (!furnishings) {
    return null;
  }

  return Array.isArray(furnishings) ? (furnishings[0] ?? null) : furnishings;
}

export function mapPropertyWithImages(
  row: PropertyRowWithRelations,
  getPublicUrl: (storagePath: string) => string,
): PropertyWithImages {
  const imageRows = row.images ?? row.property_images ?? [];
  const utilityBillRows =
    row.utility_bills ?? row.property_utility_bills ?? [];
  const {
    images: _images,
    property_images: _propertyImages,
    utility_bills: _utilityBills,
    property_utility_bills: _propertyUtilityBills,
    furnishings: _furnishings,
    property_furnishings: _propertyFurnishings,
    ...property
  } = row;

  return {
    ...property,
    images: [...imageRows]
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.created_at.localeCompare(b.created_at);
      })
      .map((image) => ({
        ...image,
        public_url: getPublicUrl(image.storage_path),
      })),
    utility_bills: [...utilityBillRows].sort((a, b) => {
      const periodCompare = b.billing_period_start.localeCompare(
        a.billing_period_start,
      );

      if (periodCompare !== 0) {
        return periodCompare;
      }

      return a.bill_type.localeCompare(b.bill_type);
    }),
    furnishings: resolveFurnishings(row),
  };
}
