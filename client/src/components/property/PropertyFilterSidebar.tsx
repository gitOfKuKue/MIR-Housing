'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import type { PropertyType } from '@/src/types/property';
import HcmcLocationSelects from './HcmcLocationSelects';
import {
  RENT_FILTER_MAX,
  RENT_FILTER_MIN,
  RENT_FILTER_STEP,
  type AmenityFilter,
  type FurnishingFilter,
  type PropertyFilters,
} from './filterProperties';

interface PropertyFilterSidebarProps {
  value: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onSearch: () => void;
}

const PROPERTY_TYPES: Array<PropertyType | 'all'> = [
  'all',
  'apartment',
  'condo',
  'house',
  'townhouse',
  'other',
];

const AMENITY_OPTIONS: AmenityFilter[] = [
  'all',
  'has_air_conditioner',
  'has_fridge',
  'has_balcony',
  'has_elevator',
  'has_hot_water',
  'has_window',
];

const FURNISHING_OPTIONS: FurnishingFilter[] = [
  'all',
  'has_bed',
  'has_mattress',
  'has_wardrobe',
  'has_tv',
  'has_loft',
];

const labelClassName =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]';

const selectClassName =
  'w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm text-[#1a1a1a] outline-none transition focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/10 disabled:cursor-not-allowed disabled:opacity-60';

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

function DualRangeSlider({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const minPercent =
    ((minValue - RENT_FILTER_MIN) / (RENT_FILTER_MAX - RENT_FILTER_MIN)) * 100;
  const maxPercent =
    ((maxValue - RENT_FILTER_MIN) / (RENT_FILTER_MAX - RENT_FILTER_MIN)) * 100;

  return (
    <div className="relative h-6">
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#e5e7eb]" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#1e4636]"
        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
      />
      <input
        type="range"
        min={RENT_FILTER_MIN}
        max={RENT_FILTER_MAX}
        step={RENT_FILTER_STEP}
        value={minValue}
        onChange={(event) => {
          const next = Number(event.target.value);
          onMinChange(Math.min(next, maxValue));
        }}
        className="pointer-events-none absolute inset-0 m-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1e4636] [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1e4636] [&::-moz-range-thumb]:bg-white"
        aria-label="Minimum rent"
      />
      <input
        type="range"
        min={RENT_FILTER_MIN}
        max={RENT_FILTER_MAX}
        step={RENT_FILTER_STEP}
        value={maxValue}
        onChange={(event) => {
          const next = Number(event.target.value);
          onMaxChange(Math.max(next, minValue));
        }}
        className="pointer-events-none absolute inset-0 m-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1e4636] [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1e4636] [&::-moz-range-thumb]:bg-white"
        aria-label="Maximum rent"
      />
    </div>
  );
}

export default function PropertyFilterSidebar({
  value,
  onChange,
  onSearch,
}: PropertyFilterSidebarProps) {
  const t = useTranslations();

  function update(patch: Partial<PropertyFilters>) {
    onChange({ ...value, ...patch });
  }

  function typeLabel(type: PropertyType | 'all') {
    if (type === 'all') return t('properties.allRoomTypes');
    return t(`type.${type}` as TranslationKey);
  }

  function amenityLabel(option: AmenityFilter) {
    if (option === 'all') return t('properties.selectAmenity');
    const map: Record<Exclude<AmenityFilter, 'all'>, TranslationKey> = {
      has_air_conditioner: 'furnishing.airConditioner',
      has_fridge: 'furnishing.fridge',
      has_balcony: 'furnishing.balcony',
      has_elevator: 'furnishing.elevator',
      has_hot_water: 'furnishing.hotWater',
      has_window: 'furnishing.window',
    };
    return t(map[option]);
  }

  function furnishingLabel(option: FurnishingFilter) {
    if (option === 'all') return t('properties.selectFurnishing');
    const map: Record<Exclude<FurnishingFilter, 'all'>, TranslationKey> = {
      has_bed: 'furnishing.bed',
      has_mattress: 'furnishing.mattress',
      has_wardrobe: 'furnishing.wardrobe',
      has_tv: 'furnishing.tv',
      has_loft: 'furnishing.loft',
    };
    return t(map[option]);
  }

  return (
    <aside className="rounded-xl border border-[#e8e4dc] bg-white p-5 shadow-sm">
      <h2 className="border-b border-[#e8e4dc] pb-3 text-sm font-bold uppercase tracking-wide text-[#1a1a1a]">
        {t('properties.filterTitle')}
      </h2>

      <div className="mt-5 flex flex-col gap-4">
        <HcmcLocationSelects
          value={{
            districtCode: value.districtCode,
            district: value.district,
            ward: value.ward,
            street: value.street,
          }}
          onChange={(next) =>
            update({
              districtCode: next.districtCode,
              district: next.district,
              ward: next.ward,
              street: next.street,
            })
          }
          showLabels
          selectClassName={selectClassName}
          labelClassName={labelClassName}
          labels={{
            district: t('properties.filterDistrict'),
            ward: t('properties.filterWard'),
            street: t('properties.filterStreet'),
            allDistricts: t('properties.allDistricts'),
            allWards: t('properties.allWards'),
            allStreets: t('properties.allStreets'),
            loadingDistricts: t('properties.loadingDistricts'),
            loadingWards: t('properties.loadingWards'),
            loadingStreets: t('properties.loadingStreets'),
            selectDistrictFirst: t('properties.selectDistrictFirst'),
            selectWardFirst: t('properties.selectWardFirst'),
            noStreets: t('properties.noStreets'),
          }}
        />
      </div>

      <div className="my-5 border-t border-[#e8e4dc]" />

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className={labelClassName}>{t('properties.filterRoomType')}</span>
          <select
            value={value.propertyType}
            onChange={(event) =>
              update({
                propertyType: event.target
                  .value as PropertyFilters['propertyType'],
              })
            }
            className={selectClassName}
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClassName}>{t('properties.filterAmenity')}</span>
          <select
            value={value.amenity}
            onChange={(event) =>
              update({ amenity: event.target.value as AmenityFilter })
            }
            className={selectClassName}
          >
            {AMENITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {amenityLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClassName}>
            {t('properties.filterFurnishing')}
          </span>
          <select
            value={value.furnishing}
            onChange={(event) =>
              update({ furnishing: event.target.value as FurnishingFilter })
            }
            className={selectClassName}
          >
            {FURNISHING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {furnishingLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="my-5 border-t border-[#e8e4dc]" />

      <div>
        <span className={labelClassName}>{t('properties.filterPriceRange')}</span>
        <DualRangeSlider
          minValue={value.minRent}
          maxValue={value.maxRent}
          onMinChange={(minRent) => update({ minRent })}
          onMaxChange={(maxRent) => update({ maxRent })}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-[#6b7280]">
          <span>{formatVnd(value.minRent)}</span>
          <span>{formatVnd(value.maxRent)}</span>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-[#1a1a1a]">
        <input
          type="checkbox"
          checked={value.includeRented}
          onChange={(event) => update({ includeRented: event.target.checked })}
          className="h-4 w-4 rounded border-[#d1d5db] text-[#1e4636] focus:ring-[#1e4636]"
        />
        {t('properties.showRented')}
      </label>

      <button
        type="button"
        onClick={onSearch}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e4636] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#163828]"
      >
        <SearchIcon />
        {t('properties.searchAction')}
      </button>
    </aside>
  );
}
