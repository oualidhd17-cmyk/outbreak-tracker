'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/useI18n';

export default function AboutPage() {
  const { t, locale } = useI18n();
  const isArabic = locale === 'ar';

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-dvh bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-white/45 hover:text-white">
          ← {isArabic ? 'العودة إلى اللوحة' : 'Back to dashboard'}
        </Link>

        <section className="mt-8 border border-white/10 bg-[#050505] p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/75">
            HantaMap
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {t('trust.title')}
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-white/62">
            {t('trust.description')}
          </p>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="border border-white/10 bg-[#050505] p-5">
            <h2 className="text-lg font-semibold text-white">
              {isArabic ? 'ما الذي تعرضه المنصة؟' : 'What does it show?'}
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/58">
              <li>{isArabic ? 'خريطة تفاعلية للحالات.' : 'Interactive outbreak map.'}</li>
              <li>{isArabic ? 'الخط الزمني للتحديثات.' : 'Timeline of updates.'}</li>
              <li>{isArabic ? 'مصادر صحية رسمية وموثوقة.' : 'Official and trusted health sources.'}</li>
              <li>{isArabic ? 'حالات مؤكدة وغير مؤكدة عند توفرها.' : 'Confirmed and unconfirmed signals when available.'}</li>
            </ul>
          </div>

          <div className="border border-white/10 bg-[#050505] p-5">
            <h2 className="text-lg font-semibold text-white">
              {isArabic ? 'ما الهدف؟' : 'What is the goal?'}
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/58">
              {isArabic
                ? 'الهدف هو عرض المعلومات العامة من المصادر الصحية الرسمية بطريقة واضحة وهادئة، بدون تهويل أو ادعاءات طبية.'
                : 'The goal is to present public information from official health sources in a clear, calm way, without panic-driven language or medical claims.'}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}