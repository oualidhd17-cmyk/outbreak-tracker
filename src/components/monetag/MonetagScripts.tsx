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
    id: 'monetag-good-tag',
    zone: '10978399',
    src: 'https://al5sm.com/tag.min.js',
  },
  {
    id: 'monetag-pungent-vignette',
    zone: '10978400',
    src: 'https://n6wxm.com/vignette.min.js',
  },
];

function appendMonetagScript(item: MonetagZone): void {
  if (document.getElementById(item.id)) {
    return;
  }

  const script = document.createElement('script');

  script.id = item.id;
  script.async = true;
  script.dataset.zone = item.zone;
  script.dataset.cfasync = 'false';
  script.src = item.src;

  document.body.appendChild(script);
}

export function MonetagScripts() {
  useEffect(() => {
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