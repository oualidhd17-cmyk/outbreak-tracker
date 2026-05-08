'use client';

import Link from 'next/link';

import { useI18n } from '@/i18n/useI18n';

export default function FaqPage() {
  const { t, locale } = useI18n();
  const isArabic = locale === 'ar';

  const faqs = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1'),
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2'),
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3'),
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4'),
    },
  ];

  return (
    <main
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-dvh bg-black px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          {isArabic ? 'العودة إلى اللوحة' : 'Back to dashboard'}
        </Link>

        <section className="mt-6 overflow-hidden border border-white/10 bg-[#050505] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="relative border-b border-white/10 p-5 sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_36%)]" />

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-300/75">
                FAQ
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
                {t('faq.title')}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                {t('faq.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid gap-2 p-3 sm:p-4">
            {faqs.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group border border-white/10 bg-white/[0.025] transition open:border-white/20 open:bg-white/[0.045]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold text-white marker:hidden sm:px-5 sm:py-5 sm:text-base">
                  <span className="leading-7">{item.question}</span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 bg-black/40 text-base leading-none text-white/45 transition group-open:rotate-45 group-open:border-red-300/25 group-open:text-red-200">
                    +
                  </span>
                </summary>

                <div className="border-t border-white/10 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                  <p className="text-sm leading-8 text-white/60">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}