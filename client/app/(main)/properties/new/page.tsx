'use client';

import { CreatePropertyForm } from '@/src/components/property';
import { useTranslations } from '@/src/i18n';
import { getAuthUser } from '@/src/lib/auth';
import { canManageProperties } from '@/src/lib/roles';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CreatePropertyPage() {
  const t = useTranslations();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    setAllowed(canManageProperties(getAuthUser()?.role));
  }, []);

  if (allowed === null) {
    return null;
  }

  if (!allowed) {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {t('properties.createForbidden')}
        </div>
        <Link
          href="/properties"
          className="mt-4 inline-block text-sm font-medium text-[#1e4636] hover:underline"
        >
          {t('detail.backToProperties')}
        </Link>
      </div>
    );
  }

  return <CreatePropertyForm />;
}
