'use client';

import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  id: string;
  label?: string;
  className?: string;
  variant?: 'top' | 'sidebar' | 'side' | 'mobile' | 'inline';
};

const ADSENSE_CLIENT_ID = 'ca-pub-7200463371794521';

const ADSENSE_DISPLAY_SLOT_ID = '6282664948';
const ADSENSE_MULTIPLEX_SLOT_ID = '6995061524';

const MIN_AD_WIDTH = 120;

function adsAreEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADS_ENABLED === 'false';
}

function getAdSenseSlot(id: string, variant: AdSlotProps['variant']): string {
  const normalizedId = id.toLowerCase();

  if (normalizedId.includes('multiplex')) {
    return ADSENSE_MULTIPLEX_SLOT_ID;
  }

  if (
    variant === 'top' ||
    variant === 'sidebar' ||
    variant === 'side' ||
    variant === 'inline' ||
    variant === 'mobile'
  ) {
    return ADSENSE_DISPLAY_SLOT_ID;
  }

  return ADSENSE_DISPLAY_SLOT_ID;
}

function getMinHeight(variant: AdSlotProps['variant']): number {
  if (variant === 'top') {
    return 90;
  }

  if (variant === 'sidebar') {
    return 250;
  }

  if (variant === 'side') {
    return 250;
  }

  if (variant === 'inline') {
    return 120;
  }

  if (variant === 'mobile') {
    return 60;
  }

  return 90;
}

export function AdSlot({
  id,
  className,
  variant = 'top',
}: AdSlotProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  const adSlot = useMemo(() => {
    return getAdSenseSlot(id, variant);
  }, [id, variant]);

  const minHeight = useMemo(() => {
    return getMinHeight(variant);
  }, [variant]);

  useEffect(() => {
    if (!adsAreEnabled()) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const wrapper = wrapperRef.current;
    const adElement = adRef.current;

    if (!wrapper || !adElement) {
      return;
    }

    const hideSlot = () => {
      wrapper.style.display = 'none';
    };

    const showSlot = () => {
      wrapper.style.display = '';
    };

    const pushAd = () => {
      if (pushedRef.current) {
        return;
      }

      const width = wrapper.getBoundingClientRect().width;

      if (width < MIN_AD_WIDTH) {
        return;
      }

      const status = adElement.getAttribute('data-adsbygoogle-status');

      if (status === 'done') {
        pushedRef.current = true;
        return;
      }

      try {
        showSlot();
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      } catch {
        hideSlot();
      }
    };

    const observer = new ResizeObserver(() => {
      pushAd();
    });

    observer.observe(wrapper);

    const startTimer = window.setTimeout(() => {
      pushAd();
    }, 700);

    const hideTimer = window.setTimeout(() => {
      const status = adElement.getAttribute('data-ad-status');
      const hasIframe = Boolean(adElement.querySelector('iframe'));

      if (status === 'unfilled' || !hasIframe) {
        hideSlot();
      }
    }, 5000);

    return () => {
      observer.disconnect();
      window.clearTimeout(startTimer);
      window.clearTimeout(hideTimer);
    };
  }, [adSlot]);

  if (!adsAreEnabled()) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      id={id}
      data-ad-slot={variant}
      className={clsx(
        'overflow-hidden',
        variant === 'top' && 'w-full',
        variant === 'sidebar' && 'w-full',
        variant === 'side' && 'w-full',
        variant === 'inline' && 'w-full',
        variant === 'mobile' &&
          'fixed inset-x-3 bottom-3 z-[9999] md:hidden',
        className,
      )}
      style={{
        minWidth: MIN_AD_WIDTH,
        minHeight,
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minWidth: MIN_AD_WIDTH,
          minHeight,
        }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}