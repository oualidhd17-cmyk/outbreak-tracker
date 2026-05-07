'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import {
  DEFAULT_LOCALE,
  getLocaleDirection,
  LOCALES,
  translate,
  type AppLocale,
  type TranslationKey,
} from '@/i18n/messages';

const STORAGE_KEY = 'outbreak_tracker_locale';
const LOCALE_CHANGE_EVENT = 'outbreak-tracker-locale-change';

function isAppLocale(value: string | null): value is AppLocale {
  return value === 'en' || value === 'ar' || value === 'fr' || value === 'es';
}

function getBrowserLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const savedLocale = window.localStorage.getItem(STORAGE_KEY);

  if (isAppLocale(savedLocale)) {
    return savedLocale;
  }

  const browserLocale = window.navigator.language.slice(0, 2);

  if (isAppLocale(browserLocale)) {
    return browserLocale;
  }

  return DEFAULT_LOCALE;
}

function getServerLocale(): AppLocale {
  return DEFAULT_LOCALE;
}

function subscribeToLocaleChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  const handleCustomChange = () => {
    callback();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(LOCALE_CHANGE_EVENT, handleCustomChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(LOCALE_CHANGE_EVENT, handleCustomChange);
  };
}

function syncDocumentLocale(locale: AppLocale): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = locale;
  document.documentElement.dir = getLocaleDirection(locale);
}

function saveLocale(locale: AppLocale): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, locale);
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
}

export function useI18n() {
  const locale = useSyncExternalStore(
    subscribeToLocaleChanges,
    getBrowserLocale,
    getServerLocale,
  );

  const dir = getLocaleDirection(locale);

  useEffect(() => {
    syncDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    saveLocale(nextLocale);
    syncDocumentLocale(nextLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      return translate(locale, key);
    },
    [locale],
  );

  return useMemo(
    () => ({
      locale,
      dir,
      locales: LOCALES,
      setLocale,
      t,
    }),
    [dir, locale, setLocale, t],
  );
}