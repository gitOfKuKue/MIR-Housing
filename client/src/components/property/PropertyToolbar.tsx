'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import type { PropertyStatus, PropertyType } from '@/src/types/property';

export type PropertyViewMode = 'card' | 'list';

export interface PropertyFilters {
  search: string;
  status: PropertyStatus | 'all';
  propertyType: PropertyType | 'all';
}

interface PropertyToolbarProps {
  filters: PropertyFilters;
  viewMode: PropertyViewMode;
  page: number;
  pageSize: number;
  total: number;
  onFiltersChange: (filters: PropertyFilters) => void;
  onViewModeChange: (mode: PropertyViewMode) => void;
}

const PROPERTY_STATUSES: Array<PropertyStatus | 'all'> = [
  'all',
  'available',
  'rented',
  'maintenance',
  'inactive',
];

const PROPERTY_TYPES: Array<PropertyType | 'all'> = [
  'all',
  'apartment',
  'condo',
  'house',
  'townhouse',
  'other',
];

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

function GridIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PropertyToolbar({
  filters,
  viewMode,
  page,
  pageSize,
  total,
  onFiltersChange,
  onViewModeChange,
}: PropertyToolbarProps) {
  const t = useTranslations();

  function updateFilters(patch: Partial<PropertyFilters>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function statusLabel(status: PropertyStatus | 'all') {
    if (status === 'all') return t('properties.allStatuses');
    return t(`status.${status}` as TranslationKey);
  }

  function typeLabel(type: PropertyType | 'all') {
    if (type === 'all') return t('properties.allTypes');
    return t(`type.${type}` as TranslationKey);
  }

  return (
    <section className="mb-8 rounded-lg border border-[#e8e4dc] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder={t('properties.searchPlaceholder')}
            className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafaf9] py-3 pl-11 pr-4 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1e4636] focus:bg-white focus:ring-2 focus:ring-[#1e4636]/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#6b7280]">
            <span className="sr-only">{t('properties.filterStatus')}</span>
            <select
              value={filters.status}
              onChange={(event) =>
                updateFilters({
                  status: event.target.value as PropertyFilters['status'],
                })
              }
              className="rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2.5 text-sm font-medium text-[#1a1a1a] outline-none transition focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/10"
            >
              {PROPERTY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-[#6b7280]">
            <span className="sr-only">{t('properties.filterType')}</span>
            <select
              value={filters.propertyType}
              onChange={(event) =>
                updateFilters({
                  propertyType: event.target
                    .value as PropertyFilters['propertyType'],
                })
              }
              className="rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2.5 text-sm font-medium text-[#1a1a1a] outline-none transition focus:border-[#1e4636] focus:ring-2 focus:ring-[#1e4636]/10"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {typeLabel(type)}
                </option>
              ))}
            </select>
          </label>

          <div
            className="flex rounded-lg border border-[#e5e7eb] bg-[#fafaf9] p-1"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('card')}
              aria-pressed={viewMode === 'card'}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                viewMode === 'card'
                  ? 'bg-[#1e4636] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#1a1a1a]'
              }`}
            >
              <GridIcon />
              <span className="hidden sm:inline">{t('properties.card')}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-[#1e4636] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#1a1a1a]'
              }`}
            >
              <ListIcon />
              <span className="hidden sm:inline">{t('properties.list')}</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#6b7280]">
        {total === 0
          ? t('properties.foundZero')
          : t('properties.showing', {
              from: (page - 1) * pageSize + 1,
              to: Math.min(page * pageSize, total),
              total,
            })}
      </p>
    </section>
  );
}
