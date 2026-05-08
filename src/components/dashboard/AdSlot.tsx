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

export function AdSlot({
  id,
  className,
  variant = 'top',
}: AdSlotProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const adRef = useRef<HTMLModElement | null>(null);

  const adSlot = useMemo(() => {
    return getAdSenseSlot(id, variant);
  }, [id, variant]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const hideSlot = () => {
      const wrapper = wrapperRef.current;

      if (!wrapper) {
        return;
      }

      wrapper.style.display = 'none';
    };

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      hideSlot();
      return;
    }

    const timer = window.setTimeout(() => {
      const element = adRef.current;

      if (!element) {
        hideSlot();
        return;
      }

      const status = element.getAttribute('data-ad-status');
      const hasIframe = Boolean(element.querySelector('iframe'));
      const height = element.offsetHeight;

      if (status === 'unfilled' || (!hasIframe && height <= 0)) {
        hideSlot();
      }
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [adSlot]);

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
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
        }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}