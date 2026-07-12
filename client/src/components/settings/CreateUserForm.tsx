'use client';

import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';
import { createUser } from '@/src/lib/api';
import { getAuthUser } from '@/src/lib/auth';
import { getDefaultPassword } from '@/src/lib/default-password';
import {
  getCreatableRoles,
  type StaffRole,
} from '@/src/lib/roles';
import { FormEvent, useMemo, useState } from 'react';

const inputClassName =
  'w-full rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1e4636] focus:bg-white focus:ring-2 focus:ring-[#1e4636]/10';

const labelClassName = 'mb-1.5 block text-sm font-medium text-[#4b5563]';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const ROLE_LABEL_KEYS: Record<StaffRole, TranslationKey> = {
  admin: 'settings.roleAdmin',
  sale: 'settings.roleSale',
  contributor: 'settings.roleContributor',
};

export default function CreateUserForm() {
  const t = useTranslations();
  const defaultPassword = getDefaultPassword();
  const creatableRoles = useMemo(() => {
    const actorRole = getAuthUser()?.role;
    if (!actorRole) return [] as StaffRole[];
    return getCreatableRoles(actorRole);
  }, []);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(defaultPassword);
  const [confirmPassword, setConfirmPassword] = useState(defaultPassword);
  const [role, setRole] = useState<StaffRole>(
    creatableRoles[0] ?? 'contributor',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError(t('settings.createUserPasswordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('settings.createUserPasswordMismatch'));
      return;
    }

    if (!creatableRoles.includes(role)) {
      setError(t('settings.createUserRoleForbidden'));
      return;
    }

    setSubmitting(true);

    try {
      const response = await createUser({
        email: email.trim(),
        password,
        role,
        ...(fullName.trim() ? { full_name: fullName.trim() } : {}),
      });

      setSuccess(
        t('settings.createUserSuccess', {
          email: response.user.email,
        }),
      );
      setFullName('');
      setEmail('');
      const nextDefaultPassword = getDefaultPassword();
      setPassword(nextDefaultPassword);
      setConfirmPassword(nextDefaultPassword);
      setRole(creatableRoles[0] ?? 'contributor');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('settings.createUserFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (creatableRoles.length === 0) {
    return (
      <p className="text-sm text-[#6b7280]">{t('settings.createUserNoAccess')}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="create-user-full-name" className={labelClassName}>
          {t('settings.createUserFullName')}
        </label>
        <input
          id="create-user-full-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClassName}
          placeholder={t('settings.createUserFullNamePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="create-user-email" className={labelClassName}>
          {t('settings.createUserEmail')} <span className="text-red-500">*</span>
        </label>
        <input
          id="create-user-email"
          type="email"
          autoComplete="off"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClassName}
          placeholder="name@example.com"
        />
      </div>

      <div>
        <label htmlFor="create-user-role" className={labelClassName}>
          {t('settings.createUserRole')}
        </label>
        <select
          id="create-user-role"
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          className={inputClassName}
          disabled={creatableRoles.length === 1}
        >
          {creatableRoles.map((option) => (
            <option key={option} value={option}>
              {t(ROLE_LABEL_KEYS[option])}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="create-user-password" className={labelClassName}>
          {t('settings.createUserPassword')}{' '}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="create-user-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClassName} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#4b5563]"
            aria-label={
              showPassword ? t('auth.hidePassword') : t('auth.showPassword')
            }
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[#9ca3af]">
          {t('settings.createUserPasswordDefaultHint', {
            password: defaultPassword,
          })}
        </p>
      </div>

      <div>
        <label
          htmlFor="create-user-confirm-password"
          className={labelClassName}
        >
          {t('settings.createUserConfirmPassword')}{' '}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="create-user-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${inputClassName} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#4b5563]"
            aria-label={
              showConfirmPassword
                ? t('auth.hidePassword')
                : t('auth.showPassword')
            }
          >
            <EyeIcon open={showConfirmPassword} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-[#1e4636] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163829] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? t('settings.createUserCreating')
          : t('settings.createUserSubmit')}
      </button>
    </form>
  );
}
