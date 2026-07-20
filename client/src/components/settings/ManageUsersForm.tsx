'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import {
  deleteAdminUser,
  listManagedUsers,
  setUserActive,
  type ManagedUser,
} from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import {
  canManageAccount,
  type StaffRole,
} from '@/src/lib/roles';
import { useCallback, useEffect, useState } from 'react';

const ROLE_LABEL_KEYS: Record<StaffRole, TranslationKey> = {
  super_admin: 'settings.roleSuperAdmin',
  admin: 'settings.roleAdmin',
  sale: 'settings.roleSale',
  contributor: 'settings.roleContributor',
};

export default function ManageUsersForm() {
  const t = useTranslations();
  const actorRole = getAuthUser()?.role;
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await listManagedUsers();
      setUsers(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('settings.manageUsersLoadFailed'),
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleToggleActive(user: ManagedUser) {
    setBusyId(user.id);
    setError('');
    setMessage('');
    try {
      const response = await setUserActive(user.id, !user.is_active);
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? response.user : item)),
      );
      setMessage(
        response.user.is_active
          ? t('settings.userReactivated')
          : t('settings.userDeactivated'),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('settings.userActionFailed'),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteAdmin(user: ManagedUser) {
    if (!window.confirm(t('settings.deleteAdminConfirm'))) return;

    setBusyId(user.id);
    setError('');
    setMessage('');
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setMessage(t('settings.userDeleted'));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('settings.userActionFailed'),
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-[#e5e7eb]"
          />
        ))}
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-sm text-[#6b7280]">{t('settings.manageUsersEmpty')}</p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          {message}
        </div>
      ) : null}

      <ul className="divide-y divide-[#e8e4dc] overflow-hidden rounded-xl border border-[#e8e4dc] bg-white">
        {users.map((user) => {
          const canManage =
            actorRole && canManageAccount(actorRole, user.role);
          const canDelete =
            actorRole === 'super_admin' && user.role === 'admin';

          return (
            <li
              key={user.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                  {user.full_name || user.email || t('settings.noEmail')}
                </p>
                <p className="truncate text-xs text-[#6b7280]">
                  {user.email || t('settings.noEmail')}
                </p>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  {t(ROLE_LABEL_KEYS[user.role])}
                  {' · '}
                  {user.is_active
                    ? t('settings.userActive')
                    : t('settings.userInactive')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canManage ? (
                  <button
                    type="button"
                    disabled={busyId === user.id}
                    onClick={() => void handleToggleActive(user)}
                    className="rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 text-xs font-semibold text-[#1a1a1a] transition hover:bg-[#f9fafb] disabled:opacity-50"
                  >
                    {user.is_active
                      ? t('settings.deactivateUser')
                      : t('settings.reactivateUser')}
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    disabled={busyId === user.id}
                    onClick={() => void handleDeleteAdmin(user)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {t('settings.deleteAdmin')}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
