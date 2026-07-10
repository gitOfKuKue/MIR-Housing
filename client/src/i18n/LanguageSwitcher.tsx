'use client';

import { useLanguage } from '@/src/i18n/LanguageProvider';
import { LOCALE_LABELS, type Locale } from '@/src/i18n/types';

export default function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[#e5e7eb] p-0.5 ${className ?? ''}`}
      role="group"
      aria-label="Language"
    >
      {(['en', 'vn'] as Locale[]).map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
              active
                ? 'bg-[#1e4636] text-white'
                : 'text-[#6b7280] hover:text-[#1e4636]'
            }`}
          >
            {LOCALE_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
