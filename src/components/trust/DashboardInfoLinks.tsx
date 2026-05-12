'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/useI18n';
// 👇 استيراد البيانات المولدة برمجياً
import seoData from '../../../public/data/seo-keywords.json';

export function DashboardInfoLinks() {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';

  const links = isArabic
    ? [
        {
          href: '/about',
          eyebrow: 'حول المنصة',
          title: 'مصمم للوضوح وليس للتهويل',
          description: 'تعرف على هدف HantaUpdates وكيف يتم عرض البيانات.',
        },
        {
          href: '/sources',
          eyebrow: 'مصادر البيانات',
          title: 'مصادر صحية رسمية وموثوقة',
          description: 'WHO و CDC و ECDC و Africa CDC و ReliefWeb.',
        },
        {
          href: '/trends',
          eyebrow: 'الترندات',
          title: 'ترندات صحية مباشرة',
          description: 'صفحات تلقائية للكلمات الصحية الرائجة مع روابط المصادر.',
        },
        {
          href: '/faq',
          eyebrow: 'الأسئلة الشائعة',
          title: 'إجابات مختصرة وواضحة',
          description: 'معلومات أساسية حول Hantavirus وطريقة قراءة البيانات.',
        },
        {
          href: '/medical-disclaimer',
          eyebrow: 'إخلاء المسؤولية',
          title: 'معلومات عامة وليست نصيحة طبية',
          description: 'اتبع دائمًا إرشادات الجهات الصحية المختصة.',
        },
      ]
    : [
        {
          href: '/about',
          eyebrow: 'About',
          title: 'Built for clarity, not panic',
          description: 'Learn what HantaUpdates does and how the data is presented.',
        },
        {
          href: '/sources',
          eyebrow: 'Data sources',
          title: 'Official and trusted health sources',
          description: 'WHO, CDC, ECDC, Africa CDC, and ReliefWeb.',
        },
        {
          href: '/trends',
          eyebrow: 'Live trends',
          title: 'Health search trends',
          description:
            'Automatically generated public-health trend pages with source links.',
        },
        {
          href: '/faq',
          eyebrow: 'FAQ',
          title: 'Simple answers',
          description:
            'Basic information about Hantavirus and dashboard data.',
        },
        {
          href: '/medical-disclaimer',
          eyebrow: 'Disclaimer',
          title: 'Information only, not medical advice',
          description: 'Always follow local health authority guidance.',
        },
      ];

  return (
    <section
      dir={isArabic ? 'rtl' : 'ltr'}
      className="mx-auto w-full max-w-[1480px] bg-[#000] px-4 pb-10 pt-6 sm:px-6 lg:px-8"
    >
      {/* شبكة الروابط الأساسية */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-lg border border-[#333] bg-[#111] p-5 transition hover:border-[#555] hover:bg-[#1a1a1a]"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {item.eyebrow}
            </p>

            <h2 className="mt-3 text-base font-bold text-white">
              {item.title}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {item.description}
            </p>

            <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-gray-600 transition group-hover:text-white">
              {isArabic ? 'فتح الصفحة' : 'Open page'} →
            </div>
          </Link>
        ))}
      </div>

      {/* 👇 قسم الكلمات المفتاحية الأكثر بحثاً (SEO) 👇 */}
      <div className="mt-12 border-t border-white/5 pt-8">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">
          {isArabic ? 'عمليات البحث الشائعة' : 'Popular Searches'}
        </p>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {seoData.primary.map((word) => (
            <span 
              key={word} 
              className="text-[10px] font-medium text-gray-500 hover:text-red-400 transition-colors cursor-default"
            >
              {word} {isArabic ? '•' : '•'}
            </span>
          ))}
        </div>

        <p className="mt-6 text-[9px] leading-relaxed text-gray-700 max-w-5xl">
          {isArabic 
            ? 'يتم تحديث هذه البيانات تلقائياً بناءً على تقارير الصحة العامة العالمية وتوجهات البحث الحية لضمان دقة المعلومات.' 
            : 'This data is automatically updated based on global public health reports and live search trends to ensure information accuracy.'}
        </p>
      </div>
    </section>
  );
}