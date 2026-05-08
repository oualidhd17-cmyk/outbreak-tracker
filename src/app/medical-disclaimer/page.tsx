'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/useI18n';

export default function MedicalDisclaimerPage() {
  const { t, locale } = useI18n();
  const isArabic = locale === 'ar';

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-dvh bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-white/45 hover:text-white">
          ← {isArabic ? 'العودة إلى اللوحة' : 'Back to dashboard'}
        </Link>

        <section className="mt-8 overflow-hidden border border-amber-300/20 bg-[#0b0903]">
          <div className="relative p-5 sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(252,211,77,0.14),transparent_34%),linear-gradient(90deg,rgba(252,211,77,0.08),transparent_42%)]" />

            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center border border-amber-300/25 bg-amber-300/10 text-xl font-bold text-amber-200">
                !
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                Information only
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
                {t('trust.disclaimerTitle')}
              </h1>

              <p className="mt-5 text-base leading-8 text-white/68">
                {t('trust.disclaimerDescription')}
              </p>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm leading-7 text-white/45">
                  This dashboard avoids panic-driven language and presents
                  official-source public information for awareness only.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}