'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import { getMe, logout } from '@/src/lib/api';
import {
  clearSession,
  getAuthUser,
  setAuthUser,
  type AuthUser,
} from '@/src/lib/auth';
import type { StaffRole } from '@/src/lib/roles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ROLE_LABEL_KEYS: Record<StaffRole, TranslationKey> = {
  super_admin: 'settings.roleSuperAdmin',
  admin: 'settings.roleAdmin',
  sale: 'settings.roleSale',
  contributor: 'settings.roleContributor',
};

function getInitials(user: AuthUser): string {
  const source = user.full_name?.trim() || user.email || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.48.63.82 1.51.91H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 11V8a4 4 0 018 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 7V5a2 2 0 012-2h7v18h-7a2 2 0 01-2-2v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3m0 0l3-3m-3 3l3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError('');

      const cached = getAuthUser();
      if (cached && !cancelled) {
        setUser(cached);
      }

      try {
        const response = await getMe();
        if (!cancelled) {
          setAuthUser(response.user);
          setUser(response.user);
        }
      } catch (err) {
        if (!cancelled) {
          if (!cached) {
            setError(
              err instanceof Error ? err.message : t('profile.loadFailed'),
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Clear local session even if the API is unreachable.
    } finally {
      clearSession();
      router.replace('/login');
    }
  }

  if (loading && !user) {
    return (
      <div className="p-6 sm:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[#e5e7eb]" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#e5e7eb]" />
        <div className="mt-8 h-48 max-w-2xl animate-pulse rounded-xl bg-[#e5e7eb]" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || t('profile.loadFailed')}
        </div>
      </div>
    );
  }

  const displayName = user.full_name?.trim() || t('profile.noName');
  const roleLabel = t(ROLE_LABEL_KEYS[user.role]);

  return (
    <div className="h-full overflow-y-auto p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">{t('profile.title')}</h1>
      <p className="mt-2 text-sm text-[#6b7280]">{t('profile.subtitle')}</p>

      <div className="mt-8 max-w-2xl space-y-6">
        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1e4636] text-lg font-semibold text-white"
              aria-hidden="true"
            >
              {getInitials(user)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-semibold text-[#1a1a1a]">
                {displayName}
              </h2>
              <p className="mt-1 truncate text-sm text-[#6b7280]">{user.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-[#e8f3ed] px-3 py-1 text-xs font-semibold text-[#1e4636]">
                {roleLabel}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#9ca3af]">
            {t('profile.accountSection')}
          </h3>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
                {t('profile.fullName')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#1a1a1a]">
                {displayName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
                {t('profile.email')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#1a1a1a]">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">
                {t('profile.role')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#1a1a1a]">
                {roleLabel}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#9ca3af]">
            {t('profile.actionsSection')}
          </h3>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm font-medium text-[#1a1a1a] transition hover:border-[#1e4636] hover:bg-[#fafaf9]"
            >
              <SettingsIcon />
              {t('profile.openSettings')}
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm font-medium text-[#1a1a1a] transition hover:border-[#1e4636] hover:bg-[#fafaf9]"
            >
              <LockIcon />
              {t('profile.changePassword')}
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="inline-flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              <LogoutIcon />
              {loggingOut ? t('auth.logout') : t('profile.logout')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
