'use client';

import { useMemo } from 'react';

import { useI18n } from '@/i18n/useI18n';
import type { OutbreakGlobalStats } from '@/types/outbreak';

type OutbreakStructuredDataProps = {
  global?: OutbreakGlobalStats | null;
};

export function OutbreakStructuredData({
  global,
}: OutbreakStructuredDataProps) {
  const { t, locale } = useI18n();

  const jsonLd = useMemo(() => {
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

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: t('app.title'),
          description: t('app.subtitle'),
          inLanguage: locale,
        },
        {
          '@type': 'Dataset',
          name: `${global?.disease ?? 'Outbreak'} public-health tracking dataset`,
          description:
            'Static public-health outbreak dataset compiled from official and high-confidence public sources.',
          creator: {
            '@type': 'Organization',
            name: 'Outbreak Tracker',
          },
          keywords: [
            global?.disease ?? 'outbreak',
            'public health',
            'WHO',
            'CDC',
            'ECDC',
            'outbreak tracker',
          ],
          dateModified: global?.last_updated,
          isAccessibleForFree: true,
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    };
  }, [global, locale, t]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}