'use client';

import { useEffect } from 'react';

const DIRECT_LINK_URL = 'https://omg10.com/4/10980928';
const STORAGE_KEY = 'hantaupdates_direct_link_opened_at';
const COOLDOWN_MS = 30 * 60 * 1000; // مرة كل 30 دقيقة

function canOpenDirectLink(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const lastOpenedAt = Number(window.sessionStorage.getItem(STORAGE_KEY) || '0');
  const now = Date.now();

  if (!lastOpenedAt) {
    return true;
  }

  return now - lastOpenedAt > COOLDOWN_MS;
}

function markDirectLinkOpened(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
}

export function SmartDirectLink() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      const interactiveElement = target.closest(
        'a, button, input, textarea, select, summary, [data-no-direct-link]',
      );

      if (!interactiveElement) {
        return;
      }

      if (!canOpenDirectLink()) {
        return;
      }

      markDirectLinkOpened();

      window.open(DIRECT_LINK_URL, '_blank', 'noopener,noreferrer');
    };

    document.addEventListener('click', handleClick, {
      passive: true,
    });

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}