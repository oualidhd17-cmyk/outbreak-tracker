'use client';

import { useEffect } from 'react';

const DIRECT_LINK_URL = 'https://omg10.com/4/10980928';

export function SmartDirectLink() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleClick = () => {
      window.open(DIRECT_LINK_URL, '_blank', 'noopener,noreferrer');
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}