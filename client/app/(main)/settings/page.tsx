'use client';

import ChangePasswordForm from '@/src/components/settings/ChangePasswordForm';
import { LanguageSwitcher, useTranslations } from '@/src/i18n';

export default function SettingsPage() {
  const t = useTranslations();

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">{t('settings.title')}</h1>
      <p className="mt-2 text-sm text-[#6b7280]">{t('settings.subtitle')}</p>

      <div className="mt-8 max-w-3xl space-y-6">
        <section className="rounded-xl border border-[#e8e4dc] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">
            {t('settings.language')}
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            {t('settings.languageHint')}
          </p>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </section>

        <ChangePasswordForm />
      </div>
    </div>
  );
}
