'use client';

import { useEffect, useRef } from 'react';

const DIRECT_LINK_URL = 'https://omg10.com/4/10980928';

const STORAGE_KEY = 'hantamap_direct_link_last_opened_at';

const OPEN_INTERVAL_HOURS = 6;
const MIN_SECONDS_BEFORE_OPEN = 10;
const MIN_SCROLL_PERCENT = 20;

function getNow(): number {
  return Date.now();
}

function getLastOpenedAt(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function canOpenDirectLink(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const lastOpenedAt = getLastOpenedAt();

  if (!lastOpenedAt) {
    return true;
  }

  const intervalMs = OPEN_INTERVAL_HOURS * 60 * 60 * 1000;

  return getNow() - lastOpenedAt >= intervalMs;
}

function markDirectLinkOpened(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, String(getNow()));
}

function getScrollPercent(): number {
  if (typeof document === 'undefined') {
    return 0;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  if (scrollHeight <= 0) {
    return 0;
  }

  return Math.round((scrollTop / scrollHeight) * 100);
}

function openDirectLink(): boolean {
  if (!canOpenDirectLink()) {
    return false;
  }

  const popup = window.open(DIRECT_LINK_URL, '_blank', 'noopener,noreferrer');

  if (!popup) {
    return false;
  }

  markDirectLinkOpened();

  return true;
}

export function DirectLinkOpener() {
  const hasOpenedRef = useRef(false);
  const pageReadyAtRef = useRef<number>(0);

  useEffect(() => {
    pageReadyAtRef.current = getNow();

    const tryOpen = () => {
      if (hasOpenedRef.current) {
        return;
      }

      if (!canOpenDirectLink()) {
        return;
      }

      const secondsOnPage = (getNow() - pageReadyAtRef.current) / 1000;

      if (secondsOnPage < MIN_SECONDS_BEFORE_OPEN) {
        return;
      }

      const scrollPercent = getScrollPercent();

      if (scrollPercent < MIN_SCROLL_PERCENT) {
        return;
      }

      const opened = openDirectLink();

      if (opened) {
        hasOpenedRef.current = true;
        cleanup();
      }
    };

    const handleClick = () => {
      tryOpen();
    };

    const handleTouchStart = () => {
      tryOpen();
    };

    const handleScroll = () => {
      tryOpen();
    };

    const handleKeyDown = () => {
      tryOpen();
    };

    const cleanup = () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };

    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return cleanup;
  }, []);

  return null;
}