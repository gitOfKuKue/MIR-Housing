'use client';

import { useTranslations } from '@/src/i18n';
import { useEffect, useState } from 'react';
import AmenityMultiSelect from './AmenityMultiSelect';
import FurnishingMultiSelect from './FurnishingMultiSelect';
import HcmcLocationSelects from './HcmcLocationSelects';
import RoomTypeSelect from './RoomTypeSelect';
import {
  RENT_FILTER_MIN,
  RENT_FILTER_STEP,
  type PropertyFilters,
} from './filterProperties';

type FilterDropdownId = 'roomType' | 'amenities' | 'furnishings' | null;

interface PropertyFilterSidebarProps {
  value: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onSearch: () => void;
  rentFilterMax: number;
}

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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatRentInput(amount: number): string {
  return amount.toLocaleString('en-US');
}

function parseRentInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampRent(value: number, rangeMax: number): number {
  return Math.min(Math.max(value, RENT_FILTER_MIN), rangeMax);
}

function DualRangeSlider({
  minValue,
  maxValue,
  rangeMax,
  onMinChange,
  onMaxChange,
}: {
  minValue: number;
  maxValue: number;
  rangeMax: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const span = Math.max(rangeMax - RENT_FILTER_MIN, 1);
  const minPercent = ((minValue - RENT_FILTER_MIN) / span) * 100;
  const maxPercent = ((maxValue - RENT_FILTER_MIN) / span) * 100;

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
        max={rangeMax}
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
        max={rangeMax}
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

const rentInputClassName =
  'w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-mono text-[#1a1a1a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/10';

export default function PropertyFilterSidebar({
  value,
  onChange,
  onSearch,
  rentFilterMax,
}: PropertyFilterSidebarProps) {
  const t = useTranslations();
  const [openDropdown, setOpenDropdown] = useState<FilterDropdownId>(null);
  const [minRentInput, setMinRentInput] = useState(() =>
    formatRentInput(value.minRent),
  );
  const [maxRentInput, setMaxRentInput] = useState(() =>
    formatRentInput(value.maxRent),
  );
  const [minFocused, setMinFocused] = useState(false);
  const [maxFocused, setMaxFocused] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!minFocused) {
      setMinRentInput(formatRentInput(value.minRent));
    }
  }, [value.minRent, minFocused]);

  useEffect(() => {
    if (!maxFocused) {
      setMaxRentInput(formatRentInput(value.maxRent));
    }
  }, [value.maxRent, maxFocused]);

  function update(patch: Partial<PropertyFilters>) {
    onChange({ ...value, ...patch });
  }

  function setDropdownOpen(id: Exclude<FilterDropdownId, null>, open: boolean) {
    setOpenDropdown(open ? id : null);
  }

  function commitMinRent(raw: string) {
    const parsed = parseRentInput(raw);
    if (parsed === null) {
      setMinRentInput(formatRentInput(value.minRent));
      return;
    }
    const next = Math.min(clampRent(parsed, rentFilterMax), value.maxRent);
    setMinRentInput(formatRentInput(next));
    update({ minRent: next });
  }

  function commitMaxRent(raw: string) {
    const parsed = parseRentInput(raw);
    if (parsed === null) {
      setMaxRentInput(formatRentInput(value.maxRent));
      return;
    }
    const next = Math.max(clampRent(parsed, rentFilterMax), value.minRent);
    setMaxRentInput(formatRentInput(next));
    update({ maxRent: next });
  }

  return (
    <aside className="rounded-xl border border-[#e8e4dc] bg-white p-5 shadow-sm">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${
          collapsed ? '' : 'border-b border-[#e8e4dc] pb-3'
        }`}
      >
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#1a1a1a]">
          {t('properties.filterTitle')}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!collapsed}
            aria-controls="property-filter-panel"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2 text-sm font-medium text-[#6b7280] transition hover:border-[#d1d5db] hover:text-[#1a1a1a]"
          >
            {collapsed ? t('common.expand') : t('common.collapse')}
            <ChevronIcon expanded={!collapsed} />
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e4636] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828]"
          >
            <SearchIcon />
            {t('properties.searchAction')}
          </button>
        </div>
      </div>

      {!collapsed ? (
      <div
        id="property-filter-panel"
        className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <div className="flex flex-col gap-4 md:col-span-2 xl:col-span-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
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
        </div>

        <div className="flex flex-col gap-4">
          <RoomTypeSelect
            value={value.roomType}
            onChange={(roomType) => update({ roomType })}
            open={openDropdown === 'roomType'}
            onOpenChange={(open) => setDropdownOpen('roomType', open)}
            labelClassName={labelClassName}
            triggerClassName={
              selectClassName + ' flex items-center justify-between text-left'
            }
          />

          <AmenityMultiSelect
            value={value.amenities}
            onChange={(amenities) => update({ amenities })}
            open={openDropdown === 'amenities'}
            onOpenChange={(open) => setDropdownOpen('amenities', open)}
            labelClassName={labelClassName}
            triggerClassName={
              selectClassName + ' flex items-center justify-between text-left'
            }
          />

          <FurnishingMultiSelect
            value={value.furnishings}
            onChange={(furnishings) => update({ furnishings })}
            open={openDropdown === 'furnishings'}
            onOpenChange={(open) => setDropdownOpen('furnishings', open)}
            labelClassName={labelClassName}
            triggerClassName={
              selectClassName + ' flex items-center justify-between text-left'
            }
          />
        </div>

        <div className="md:col-span-2 xl:col-span-2">
          <span className={labelClassName}>
            {t('properties.filterPriceRange')}
          </span>
          <DualRangeSlider
            minValue={value.minRent}
            maxValue={value.maxRent}
            rangeMax={rentFilterMax}
            onMinChange={(minRent) => update({ minRent })}
            onMaxChange={(maxRent) => update({ maxRent })}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filter_min_rent" className={labelClassName}>
                {t('properties.filterPriceMin')}
              </label>
              <input
                id="filter_min_rent"
                type="text"
                inputMode="numeric"
                value={minRentInput}
                onFocus={() => setMinFocused(true)}
                onChange={(event) => {
                  const raw = event.target.value.replace(/[^\d,]/g, '');
                  setMinRentInput(raw);
                  const parsed = parseRentInput(raw);
                  if (parsed === null) return;
                  update({
                    minRent: Math.min(
                      clampRent(parsed, rentFilterMax),
                      value.maxRent,
                    ),
                  });
                }}
                onBlur={() => {
                  setMinFocused(false);
                  commitMinRent(minRentInput);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur();
                  }
                }}
                className={rentInputClassName}
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="filter_max_rent" className={labelClassName}>
                {t('properties.filterPriceMax')}
              </label>
              <input
                id="filter_max_rent"
                type="text"
                inputMode="numeric"
                value={maxRentInput}
                onFocus={() => setMaxFocused(true)}
                onChange={(event) => {
                  const raw = event.target.value.replace(/[^\d,]/g, '');
                  setMaxRentInput(raw);
                  const parsed = parseRentInput(raw);
                  if (parsed === null) return;
                  update({
                    maxRent: Math.max(
                      clampRent(parsed, rentFilterMax),
                      value.minRent,
                    ),
                  });
                }}
                onBlur={() => {
                  setMaxFocused(false);
                  commitMaxRent(maxRentInput);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur();
                  }
                }}
                className={rentInputClassName}
                placeholder={formatRentInput(rentFilterMax)}
              />
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-[#1a1a1a]">
            <input
              type="checkbox"
              checked={value.includeRented}
              onChange={(event) =>
                update({ includeRented: event.target.checked })
              }
              className="h-4 w-4 rounded border-[#d1d5db] text-[#1e4636] focus:ring-[#1e4636]"
            />
            {t('properties.showRented')}
          </label>
        </div>
      </div>
      ) : null}
    </aside>
  );
}
