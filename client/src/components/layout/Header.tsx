'use client';

import logo from '@/src/assets/logo/logo-transparency-bg.png';
import { LanguageSwitcher } from '@/src/i18n';
import { useTranslations } from '@/src/i18n';
import { logout } from '@/src/lib/api';
import {
  clearSession,
  getAccessToken,
  getAuthUser,
  type AuthUser,
} from '@/src/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Container from './Container';

const navLinkClass =
  'text-sm font-medium text-[#4b5563] transition hover:text-[#1e4636]';

export default function Header({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(Boolean(token));
    setUser(getAuthUser());
    setAuthReady(true);
  }, [pathname]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Clear local session even if the API is unreachable.
    } finally {
      clearSession();
      setIsAuthenticated(false);
      setUser(null);
      router.replace('/login');
    }
  }

  const displayName = user?.full_name ?? user?.email;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-[#e8e4dc] bg-white ${className ?? ''}`}
    >
      <Container className="mx-auto flex h-16 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href={isAuthenticated ? '/properties' : '/'}
          className="flex items-center gap-3"
        >
          <Image
            src={logo}
            alt="MIR Housing logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-lg font-semibold tracking-tight text-[#1a1a1a]">
            MIR Housing
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <LanguageSwitcher />

          {authReady && isAuthenticated ? (
            <>
              <nav className="flex items-center gap-4 sm:gap-6">
                <Link
                  href="/properties"
                  className={`${navLinkClass} ${
                    pathname.startsWith('/properties')
                      ? 'font-semibold text-[#1e4636]'
                      : ''
                  } md:hidden`}
                >
                  {t('nav.properties')}
                </Link>
                {displayName ? (
                  <Link
                    href="/profile"
                    className={`max-w-[10rem] truncate text-sm transition hover:text-[#1e4636] sm:max-w-[12rem] ${
                      pathname.startsWith('/profile')
                        ? 'font-semibold text-[#1e4636]'
                        : 'text-[#6b7280]'
                    }`}
                  >
                    {displayName}
                  </Link>
                ) : null}
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#1a1a1a] transition hover:border-[#1e4636] hover:text-[#1e4636]"
              >
                {t('auth.logout')}
              </button>
            </>
          ) : authReady ? (
            <Link
              href="/login"
              className="rounded-lg bg-[#1e4636] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#163828]"
            >
              {t('auth.login')}
            </Link>
          ) : (
            <div className="h-9 w-20" aria-hidden="true" />
          )}
        </div>
      </Container>
    </header>
  );
}
