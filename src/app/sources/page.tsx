'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { loadSources } from '@/lib/data';
import type { OutbreakSource } from '@/types/outbreak';

const fallbackSources = [
  'World Health Organization',
  'Centers for Disease Control and Prevention',
  'European Centre for Disease Prevention and Control',
  'Africa Centres for Disease Control and Prevention',
  'ReliefWeb',
];

export default function SourcesPage() {
  const { t, locale } = useI18n();
  const isArabic = locale === 'ar';

  const [sources, setSources] = useState<OutbreakSource[]>([]);

  useEffect(() => {
    void loadSources()
      .then(setSources)
      .catch(() => setSources([]));
  }, []);

  const visibleSources =
    sources.length > 0
      ? sources
      : fallbackSources.map((name, index) => ({
          id: String(index),
          name,
          url: '',
          type: 'official' as const,
          confidence: 'high' as const,
          last_checked_at: '',
        }));

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-dvh bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-white/45 hover:text-white">
          ← {isArabic ? 'العودة إلى اللوحة' : 'Back to dashboard'}
        </Link>

        <section className="mt-8 border border-white/10 bg-[#050505] p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/75">
            {t('trust.badge')}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {t('trust.sourcesTitle')}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
            {t('trust.sourcesDescription')}
          </p>
        </section>

        <section className="mt-4 grid gap-3">
          {visibleSources.map((source) => {
            const content = (
              <div className="grid gap-3 border border-white/10 bg-[#050505] p-4 transition hover:border-white/20 hover:bg-white/[0.035] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div>
                  <h2 className="text-base font-semibold text-white">{source.name}</h2>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    {String(source.type).replace(/-/g, ' ')}
                  </p>
                </div>

                <span className="w-fit border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  {source.confidence}
                </span>
              </div>
            );

            if (source.url) {
              return (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                  {content}
                </a>
              );
            }

            return <div key={source.id}>{content}</div>;
          })}
        </section>
      </div>
    </main>
  );
}