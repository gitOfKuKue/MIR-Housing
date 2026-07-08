'use client';

import { PropertyDetail } from '@/src/components/property';
import { getProperty } from '@/src/lib/api';
import type { Property } from '@/src/types/property';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProperty() {
      setLoading(true);
      setError('');
      setNotFound(false);

      try {
        const data = await getProperty(id);
        if (!cancelled) {
          setProperty(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load property';

          if (message.toLowerCase().includes('not found')) {
            setNotFound(true);
          } else {
            setError(message);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadProperty();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-6 h-5 w-40 animate-pulse rounded bg-[#e5e7eb]" />
        <div className="h-80 animate-pulse rounded-xl bg-[#e5e7eb]" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-xl bg-[#e5e7eb] lg:col-span-2" />
          <div className="h-48 animate-pulse rounded-xl bg-[#e5e7eb]" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 sm:p-8">
        <div className="max-w-md rounded-lg border border-[#e8e4dc] bg-white px-6 py-10 text-center">
          <p className="text-lg font-semibold text-[#1a1a1a]">Property not found</p>
          <p className="mt-2 text-sm text-[#6b7280]">
            This property may have been removed or the link is invalid.
          </p>
          <Link
            href="/properties"
            className="mt-6 inline-flex rounded-lg bg-[#1e4636] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828]"
          >
            Back to properties
          </Link>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || 'Failed to load property'}
        </div>
      </div>
    );
  }

  return <PropertyDetail property={property} />;
}
