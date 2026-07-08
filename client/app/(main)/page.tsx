'use client';

import { getAccessToken } from '@/src/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    router.replace(token ? '/properties' : '/login');
  }, [router]);

  return null;
}
