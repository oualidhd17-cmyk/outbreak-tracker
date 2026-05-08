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
    <label className="inline-flex h-9 items-center gap-2 rounded border border-[#333] bg-[#1a1a1a] px-3 text-xs text-gray-400 transition-colors hover:bg-[#222]">
      <span className="font-bold uppercase tracking-wider">{label}</span>

      <select
        value={locale}
        onChange={(event) => onChange(event.target.value as AppLocale)}
        className="min-w-20 bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code} className="bg-[#111] text-white">
            {item.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}