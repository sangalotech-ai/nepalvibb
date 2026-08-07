"use client";

import { useState, useMemo, useEffect } from 'react';
import { no } from '@/translations/no';
import { en } from '@/translations/en';
import { LOCALE_COOKIE, hasLocale, defaultLocale } from '@/lib/i18n';
import { LocaleContext } from './LocaleContext';

const messages = { no, en };

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? match[2] : null;
}

export default function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(defaultLocale);

  useEffect(() => {
    const stored = readCookie(LOCALE_COOKIE);
    if (!stored || !hasLocale(stored) || stored === locale) return;
    const id = setTimeout(() => setLocaleState(stored), 0);
    return () => clearTimeout(id);
  }, [locale]);

  const t = useMemo(() => messages[locale] || messages.no, [locale]);

  const setLocale = (l) => {
    if (!hasLocale(l) || l === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(l);
  };

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}