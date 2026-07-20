'use client';

import { CreatePropertyForm } from '@/src/components/property';
import { getProperty } from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import { canEditProperties } from '@/src/lib/roles';
import type { Property } from '@/src/types/property';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditPropertyPage() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(canEditProperties(getAuthUser()?.role));
  }, []);

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }

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
  }, [id, allowed]);

  if (!allowed) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 sm:p-8">
        <div className="max-w-md rounded-lg border border-[#e8e4dc] bg-white px-6 py-10 text-center">
          <p className="text-lg font-semibold text-[#1a1a1a]">
            You do not have permission to edit properties.
          </p>
          <Link
            href={`/properties/${id}`}
            className="mt-6 inline-flex rounded-lg bg-[#1e4636] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163828]"
          >
            Back to property
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-6 h-5 w-40 animate-pulse rounded bg-[#e5e7eb]" />
        <div className="h-96 animate-pulse rounded-xl bg-[#e5e7eb]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6 sm:p-8">
        <div className="max-w-md rounded-lg border border-[#e8e4dc] bg-white px-6 py-10 text-center">
          <p className="text-lg font-semibold text-[#1a1a1a]">Property not found</p>
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

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white">
      <CreatePropertyForm property={property} />
    </div>
  );
}
