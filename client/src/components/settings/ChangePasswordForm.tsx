'use client';

import { changePassword } from '@/src/lib/api';
import { FormEvent, useState } from 'react';

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

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess(response.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to change password',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#e8e4dc] bg-white p-6">
      <h2 className="text-lg font-semibold text-[#1a1a1a]">Change password</h2>
      <p className="mt-1 text-sm text-[#6b7280]">
        Update your account password. You will stay signed in after changing it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <div>
          <label htmlFor="current-password" className={labelClassName}>
            Current password
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrentPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`${inputClassName} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#4b5563]"
              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showCurrentPassword} />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="new-password" className={labelClassName}>
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`${inputClassName} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#4b5563]"
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showNewPassword} />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-[#9ca3af]">
            Must be at least 8 characters.
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className={labelClassName}>
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
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
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
          {submitting ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
