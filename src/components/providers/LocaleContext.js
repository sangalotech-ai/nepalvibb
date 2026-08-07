"use client";

import { createContext } from 'react';
import { no } from '@/translations/no';
import { defaultLocale } from '@/lib/i18n';

export const LocaleContext = createContext({
  locale: defaultLocale,
  t: no,
  setLocale: () => {},
});