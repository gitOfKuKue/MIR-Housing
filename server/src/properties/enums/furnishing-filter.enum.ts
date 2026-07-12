export enum FurnishingFilter {
  Bed = 'bed',
  Mattress = 'mattress',
  Wardrobe = 'wardrobe',
  Pillow = 'pillow',
  Blanket = 'blanket',
  Tv = 'tv',
  Fridge = 'fridge',
  AirConditioner = 'air_conditioner',
  Loft = 'loft',
  Window = 'window',
  Balcony = 'balcony',
  HotWater = 'hot_water',
  KitchenStaff = 'kitchen_staff',
  Skylight = 'skylight',
  Pool = 'pool',
}

export const FURNISHING_FILTER_VALUES = Object.values(FurnishingFilter);

/** Maps filter values to property_furnishings boolean columns. */
export const FURNISHING_FILTER_COLUMNS: Record<FurnishingFilter, string> = {
  [FurnishingFilter.Bed]: 'has_bed',
  [FurnishingFilter.Mattress]: 'has_mattress',
  [FurnishingFilter.Wardrobe]: 'has_wardrobe',
  [FurnishingFilter.Pillow]: 'has_pillow',
  [FurnishingFilter.Blanket]: 'has_blanket',
  [FurnishingFilter.Tv]: 'has_tv',
  [FurnishingFilter.Fridge]: 'has_fridge',
  [FurnishingFilter.AirConditioner]: 'has_air_conditioner',
  [FurnishingFilter.Loft]: 'has_loft',
  [FurnishingFilter.Window]: 'has_window',
  [FurnishingFilter.Balcony]: 'has_balcony',
  [FurnishingFilter.HotWater]: 'has_hot_water',
  [FurnishingFilter.KitchenStaff]: 'has_kitchen_staff',
  [FurnishingFilter.Skylight]: 'has_skylight',
  [FurnishingFilter.Pool]: 'has_pool',
};
