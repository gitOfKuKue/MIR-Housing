'use client';

import {
  PropertyCard,
  PropertyListItem,
  PropertyPagination,
  PropertyToolbar,
  propertyFiltersToQueryParams,
  type PropertyFilters,
  type PropertyViewMode,
} from '@/src/components/property';
import { getProperties, type PaginationMeta } from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import type { Property } from '@/src/types/property';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const DEFAULT_FILTERS: PropertyFilters = {
  search: '',
  status: 'all',
  propertyType: 'all',
};

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
      />
    </svg>
  );
}

export default function PropertiesPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: CARD_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<PropertyViewMode>('card');

  const pageSize = viewMode === 'card' ? CARD_PAGE_SIZE : LIST_PAGE_SIZE;

  useEffect(() => {
    const user = getAuthUser();
    setUserName(user?.full_name ?? user?.email ?? null);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filters.search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.propertyType, pageSize]);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      setLoading(true);
      setError('');

      try {
        const response = await getProperties(
          propertyFiltersToQueryParams(
            { ...filters, search: debouncedSearch },
            page,
            pageSize,
          ),
        );

        if (!cancelled) {
          setProperties(response.data);
          setMeta(response.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load properties',
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
  }, [debouncedSearch, filters.status, filters.propertyType, page, pageSize]);

  function handleFiltersChange(nextFilters: PropertyFilters) {
    setFilters(nextFilters);
  }

  function handleViewModeChange(nextViewMode: PropertyViewMode) {
    setViewMode(nextViewMode);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasProperties = meta.total > 0;
  const showEmptyState = !loading && !error && !hasProperties;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Properties</h1>
          {userName ? (
            <p className="mt-2 text-[#6b7280]">Welcome back, {userName}.</p>
          ) : null}
        </div>

        <Link
          href="/properties/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1e4636] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828]"
        >
          <PlusIcon />
          Create New
        </Link>
      </div>

      <PropertyToolbar
        filters={filters}
        viewMode={viewMode}
        page={meta.page}
        pageSize={meta.limit}
        total={meta.total}
        onFiltersChange={handleFiltersChange}
        onViewModeChange={handleViewModeChange}
      />

      {loading ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
            {filters.search ||
            filters.status !== 'all' ||
            filters.propertyType !== 'all'
              ? 'No matching properties'
              : 'No properties yet'}
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">
            {filters.search ||
            filters.status !== 'all' ||
            filters.propertyType !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Properties will appear here once they are added to the system.'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
  );
}
