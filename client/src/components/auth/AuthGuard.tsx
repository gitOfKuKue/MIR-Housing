'use client';

import {
  getAccessToken,
  handleSessionExpired,
  isSessionExpired,
} from '@/src/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isSessionExpired()) {
      handleSessionExpired();
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return <>{children}</>;
}
