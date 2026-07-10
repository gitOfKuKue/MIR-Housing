export type Locale = 'en' | 'vn';

export const LOCALES: Locale[] = ['en', 'vn'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  vn: 'VN',
};

export const LOCALE_STORAGE_KEY = 'mir_housing_locale';

export type TranslationKey = keyof typeof import('./dictionaries/en').en;
