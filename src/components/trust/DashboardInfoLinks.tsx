'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/useI18n';

export function DashboardInfoLinks() {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';

  const links = isArabic
    ? [
        { href: '/about', eyebrow: 'حول المنصة', title: 'مصمم للوضوح وليس للتهويل', description: 'تعرف على هدف HantaMap وكيف يتم عرض البيانات.' },
        { href: '/sources', eyebrow: 'مصادر البيانات', title: 'مصادر صحية رسمية وموثوقة', description: 'WHO و CDC و ECDC و Africa CDC و ReliefWeb.' },
        { href: '/faq', eyebrow: 'الأسئلة الشائعة', title: 'إجابات مختصرة وواضحة', description: 'معلومات أساسية حول Hantavirus وطريقة قراءة البيانات.' },
        { href: '/medical-disclaimer', eyebrow: 'إخلاء المسؤولية', title: 'معلومات عامة وليست نصيحة طبية', description: 'اتبع دائمًا إرشادات الجهات الصحية المختصة.' },
      ]
    : [
        { href: '/about', eyebrow: 'About', title: 'Built for clarity, not panic', description: 'Learn what HantaMap does and how the data is presented.' },
        { href: '/sources', eyebrow: 'Data sources', title: 'Official and trusted health sources', description: 'WHO, CDC, ECDC, Africa CDC, and ReliefWeb.' },
        { href: '/faq', eyebrow: 'FAQ', title: 'Simple answers', description: 'Basic information about Hantavirus and dashboard data.' },
        { href: '/medical-disclaimer', eyebrow: 'Disclaimer', title: 'Information only, not medical advice', description: 'Always follow local health authority guidance.' },
      ];

  return (
    <section
      dir={isArabic ? 'rtl' : 'ltr'}
      className="mx-auto w-full max-w-[1480px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 bg-[#000]"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </section>
  );
}