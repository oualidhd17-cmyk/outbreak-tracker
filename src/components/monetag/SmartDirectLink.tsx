// FILE: src/components/monetag/SmartDirectLink.tsx

'use client';

import { useEffect } from 'react';

const DIRECT_LINK_URL = 'https://omg10.com/4/10980928';
const STORAGE_KEY = 'hantamap_direct_link_last_clicked';
const COOLDOWN_HOURS = 24; // سيتم تفعيل الرابط مرة واحدة كل 24 ساعة لكل مستخدم

export function SmartDirectLink() {
  useEffect(() => {
    // التأكد من أن الكود يعمل فقط في المتصفح (Client-side)
    if (typeof window === 'undefined') return;

    const handleClick = (e: MouseEvent) => {
      try {
        // التحقق من متى تم النقر آخر مرة
        const lastClickedStr = localStorage.getItem(STORAGE_KEY);

        if (lastClickedStr) {
          const lastClickedTime = parseInt(lastClickedStr, 10);
          const now = Date.now();
          const hoursSinceLastClick = (now - lastClickedTime) / (1000 * 60 * 60);

          // إذا لم تمر 24 ساعة، لا تفعل شيئاً وأوقف الحدث
          if (hoursSinceLastClick < COOLDOWN_HOURS) {
            return;
          }
        }

        // إذا وصل الكود إلى هنا، يعني أن المستخدم يضغط لأول مرة، أو مرت 24 ساعة
        window.open(DIRECT_LINK_URL, '_blank');

        // تسجيل وقت النقرة الحالية
        localStorage.setItem(STORAGE_KEY, Date.now().toString());

        // إزالة مستمع النقرات حتى لا يتم تنفيذ الكود مرة أخرى في نفس الجلسة
        document.removeEventListener('click', handleClick);
      } catch (error) {
        console.error('Error handling direct link:', error);
      }
    };

    // إضافة مستمع للنقرات على مستوى الصفحة بالكامل
    document.addEventListener('click', handleClick);

    // تنظيف المستمع عند الخروج من الصفحة
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // المكون لا يعرض أي واجهة رسومية
  return null;
}