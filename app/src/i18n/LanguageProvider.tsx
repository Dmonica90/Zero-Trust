import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALES, STORIES, detectLocale } from '../content';
import type { Locale } from '../content';
import { fill } from '../content/schema';
import type { Story } from '../content/schema';

const STORAGE_KEY = 'zero-trust:locale';

type LanguageValue = {
  locale: Locale;
  story: Story;
  setLocale: (locale: Locale) => void;
  /** Convenience wrapper: reads a UI string and fills its placeholders. */
  t: (key: keyof Story['ui'], values?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (LOCALES as readonly string[]).includes(stored ?? '') ? (stored as Locale) : null;
  } catch {
    // Private browsing and blocked site data both throw here; the default is fine.
    return null;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    return readStoredLocale() ?? detectLocale(navigator.languages ?? [navigator.language]);
  });

  // Screen readers and hyphenation both depend on the document language being
  // right, so it follows the switch rather than staying at the build-time value.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Remembering the choice is a convenience, not a requirement.
    }
  }, []);

  const value = useMemo<LanguageValue>(() => {
    const story = STORIES[locale];
    return {
      locale,
      story,
      setLocale,
      t: (key, values) => (values ? fill(story.ui[key], values) : story.ui[key]),
    };
  }, [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside a LanguageProvider');
  return value;
}
