'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ScrollControls() {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      setCanScrollUp(scrollTop > 120);
      setCanScrollDown(scrollTop + viewportHeight < pageHeight - 120);
    };

    updateScrollState();

    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!canScrollUp && !canScrollDown) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9998] flex flex-col gap-2">
      {canScrollUp ? (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/80 text-white shadow-2xl backdrop-blur transition hover:bg-white hover:text-black"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}

      {canScrollDown ? (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/80 text-white shadow-2xl backdrop-blur transition hover:bg-white hover:text-black"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}