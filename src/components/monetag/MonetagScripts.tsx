'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __hantamapMonetagLoaded?: boolean;
  }
}

type MonetagZone = {
  id: string;
  zone: string;
  src: string;
};

const MONETAG_ZONES: MonetagZone[] = [
  {
    id: 'monetag-in-page-push-banner',
    zone: '10978397',
    src: 'https://nap5k.com/tag.min.js',
  },
  {
    id: 'monetag-good-tag-onclick-popunder',
    zone: '10978399',
    src: 'https://al5sm.com/tag.min.js',
  },
  {
    id: 'monetag-pungent-vignette',
    zone: '10978400',
    src: 'https://n6wxm.com/vignette.min.js',
  },
  // 👇 تم إضافة سكربت الإشعارات (Push Notifications) الجديد هنا 👇
  {
    id: 'monetag-push-notifications',
    zone: '10994721',
    src: 'https://5gvci.com/act/files/tag.min.js',
  },
];

function appendMonetagScript(item: MonetagZone): void {
  if (document.getElementById(item.id)) {
    return;
  }

  const script = document.createElement('script');

  script.id = item.id;
  script.async = true;
  
  // بناء الرابط مع الـ Zone كما هو مطلوب في الكود الخاص بك
  if (item.id === 'monetag-push-notifications') {
    script.src = `${item.src}?z=${item.zone}`;
  } else {
    script.src = item.src;
    script.dataset.zone = item.zone;
  }
  
  script.dataset.cfasync = 'false';

  document.body.appendChild(script);
}

export function MonetagScripts() {
  useEffect(() => {
    // التأكد من عدم تحميل السكربتات أكثر من مرة
    if (window.__hantamapMonetagLoaded) {
      return;
    }

    window.__hantamapMonetagLoaded = true;

    for (const item of MONETAG_ZONES) {
      appendMonetagScript(item);
    }
  }, []);

  return null;
}