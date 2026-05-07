'use client';

import type { AppLocale } from '@/i18n/messages';

type LanguageSwitcherProps = {
  locale: AppLocale;
  locales: Array<{
    code: AppLocale;
    label: string;
    nativeName: string;
    dir: 'ltr' | 'rtl';
  }>;
  label: string;
  onChange: (locale: AppLocale) => void;
};

export function LanguageSwitcher({
  locale,
  locales,
  label,
  onChange,
}: LanguageSwitcherProps) {
  return (
    <label className="inline-flex h-10 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs text-white/60">
      <span className="uppercase tracking-[0.14em]">{label}</span>

      <select
        value={locale}
        onChange={(event) => onChange(event.target.value as AppLocale)}
        className="min-w-20 bg-transparent text-xs font-semibold text-white outline-none"
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code} className="bg-[#111111] text-white">
            {item.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}