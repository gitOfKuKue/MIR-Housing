'use client';

import {
  DEFAULT_PROPERTY_FILTERS,
  PropertyCard,
  PropertyFilterSidebar,
  PropertyListItem,
  PropertyPagination,
  PropertyToolbar,
  propertyFiltersToQueryParams,
  resolveRentFilterMax,
  RENT_FILTER_MAX_FALLBACK,
  type PropertyFilters,
  type PropertyViewMode,
} from '@/src/components/property';
import { useTranslations } from '@/src/i18n';
import {
  getProperties,
  getPropertyRentBounds,
  type PaginationMeta,
} from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import { canManageProperties } from '@/src/lib/roles';
import type { Property } from '@/src/types/property';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const CARD_PAGE_SIZE = 12;
const LIST_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function hasActiveFilters(
  filters: PropertyFilters,
  rentFilterMax: number,
): boolean {
  return Boolean(
    filters.search ||
      filters.status !== 'all' ||
      filters.propertyType !== 'all' ||
      filters.roomType !== 'all' ||
      filters.district ||
      filters.ward ||
      filters.street ||
      filters.minRent > DEFAULT_PROPERTY_FILTERS.minRent ||
      filters.maxRent < rentFilterMax ||
      filters.includeRented ||
      filters.amenities.length > 0 ||
      filters.furnishings.length > 0,
  );
}

export default function PropertiesPage() {
  const t = useTranslations();
  const [userName, setUserName] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: CARD_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rentFilterMax, setRentFilterMax] = useState(RENT_FILTER_MAX_FALLBACK);
  const [draftFilters, setDraftFilters] = useState<PropertyFilters>(
    DEFAULT_PROPERTY_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilters>(
    DEFAULT_PROPERTY_FILTERS,
  );
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<PropertyViewMode>('card');

  const pageSize = viewMode === 'card' ? CARD_PAGE_SIZE : LIST_PAGE_SIZE;

  useEffect(() => {
    const user = getAuthUser();
    setUserName(user?.full_name ?? user?.email ?? null);
    setCanCreate(canManageProperties(user?.role));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRentBounds() {
      try {
        const bounds = await getPropertyRentBounds();
        if (cancelled) return;

        const maxRent = resolveRentFilterMax(bounds.max_rent);
        setRentFilterMax(maxRent);
        setDraftFilters((prev) => ({
          ...prev,
          maxRent,
          minRent: Math.min(prev.minRent, maxRent),
        }));
        setAppliedFilters((prev) => ({
          ...prev,
          maxRent,
          minRent: Math.min(prev.minRent, maxRent),
        }));
      } catch {
        // Keep fallback ceiling when bounds cannot be loaded.
      }
    }

    loadRentBounds();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(appliedFilters.search);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appliedFilters.search]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    appliedFilters.status,
    appliedFilters.propertyType,
    appliedFilters.roomType,
    appliedFilters.district,
    appliedFilters.ward,
    appliedFilters.street,
    appliedFilters.minRent,
    appliedFilters.maxRent,
    appliedFilters.includeRented,
    pageSize,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      setLoading(true);
      setError('');

      try {
        const response = await getProperties(
          propertyFiltersToQueryParams(
            { ...appliedFilters, search: debouncedSearch },
            page,
            pageSize,
            rentFilterMax,
          ),
        );

        if (!cancelled) {
          setProperties(response.data);
          setMeta(response.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t('properties.loadFailed'),
          );
          setProperties([]);
          setMeta({
            page,
            limit: pageSize,
            total: 0,
            totalPages: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [
    debouncedSearch,
    appliedFilters.status,
    appliedFilters.propertyType,
    appliedFilters.roomType,
    appliedFilters.district,
    appliedFilters.ward,
    appliedFilters.street,
    appliedFilters.minRent,
    appliedFilters.maxRent,
    appliedFilters.includeRented,
    rentFilterMax,
    page,
    pageSize,
  ]);

  function handleSearch() {
    setAppliedFilters(draftFilters);
    setPage(1);
  }

  function handleToolbarSearchChange(search: string) {
    setDraftFilters((prev) => ({ ...prev, search }));
    setAppliedFilters((prev) => ({ ...prev, search }));
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasProperties = meta.total > 0;
  const showEmptyState = !loading && !error && !hasProperties;
  const filtersActive = hasActiveFilters(
    {
      ...appliedFilters,
      search: debouncedSearch,
    },
    rentFilterMax,
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">
            {t('properties.title')}
          </h1>
          {userName ? (
            <p className="mt-2 text-[#6b7280]">
              {t('properties.welcomeBack', { name: userName })}
            </p>
          ) : null}
        </div>

        {canCreate ? (
          <Link
            href="/properties/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1e4636] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828]"
          >
            <PlusIcon />
            {t('properties.createNew')}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72 xl:w-80">
          <PropertyFilterSidebar
            value={draftFilters}
            onChange={setDraftFilters}
            onSearch={handleSearch}
            rentFilterMax={rentFilterMax}
          />
        </div>

        <div className="min-w-0 flex-1">
          <PropertyToolbar
            viewMode={viewMode}
            page={meta.page}
            pageSize={meta.limit}
            total={meta.total}
            search={appliedFilters.search}
            onSearchChange={handleToolbarSearchChange}
            onViewModeChange={setViewMode}
          />

          {loading ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: pageSize }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[28rem] animate-pulse rounded-xl bg-[#e5e7eb]"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {Array.from({ length: pageSize }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-lg bg-[#e5e7eb]"
                  />
                ))}
              </div>
            )
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : showEmptyState ? (
            <div className="rounded-lg border border-[#e8e4dc] bg-white px-6 py-10 text-center">
              <p className="text-lg font-medium text-[#1a1a1a]">
                {filtersActive
                  ? t('properties.emptyMatching')
                  : t('properties.emptyNone')}
              </p>
              <p className="mt-2 text-sm text-[#6b7280]">
                {filtersActive
                  ? t('properties.emptyHint')
                  : t('properties.emptyNoneHint')}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'card' ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      href={`/properties/${property.id}`}
                      className="max-w-none"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {properties.map((property) => (
                    <PropertyListItem
                      key={property.id}
                      property={property}
                      href={`/properties/${property.id}`}
                    />
                  ))}
                </div>
              )}

              <PropertyPagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
                disabled={loading}
                className="mt-8"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
