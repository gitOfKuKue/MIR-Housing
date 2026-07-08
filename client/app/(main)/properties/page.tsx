'use client';

import { PropertyCard } from '@/src/components/property';
import { getAllProperties } from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import type { Property } from '@/src/types/property';
import { useEffect, useState } from 'react';

export default function PropertiesPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getAuthUser();
    setUserName(user?.full_name ?? user?.email ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      setLoading(true);
      setError('');

      try {
        const data = await getAllProperties();
        if (!cancelled) {
          setProperties(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load properties',
          );
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
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Properties</h1>
        {userName ? (
          <p className="mt-2 text-[#6b7280]">Welcome back, {userName}.</p>
        ) : null}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[28rem] animate-pulse rounded-[28px] bg-[#e5e7eb]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-2xl border border-[#e8e4dc] bg-white px-6 py-10 text-center">
          <p className="text-lg font-medium text-[#1a1a1a]">No properties yet</p>
          <p className="mt-2 text-sm text-[#6b7280]">
            Properties will appear here once they are added to the system.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
