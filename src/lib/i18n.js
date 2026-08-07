export const locales = ['no', 'en'];
export const defaultLocale = 'no';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeLabels = {
  no: { label: 'Norsk', flag: '🇳🇴' },
  en: { label: 'English', flag: '🇬🇧' },
};

export const hasLocale = (locale) => locales.includes(locale);
