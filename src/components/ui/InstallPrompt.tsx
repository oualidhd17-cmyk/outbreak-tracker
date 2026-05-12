'use client';

import { useEffect, useState, useRef } from 'react';
import { Download, X } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';

// 1. تعريف الخصائص الإضافية للمتصفح لتجنب خطأ (any)
declare global {
  interface Window {
    MSStream?: unknown;
  }
  interface Navigator {
    standalone?: boolean;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const { locale } = useI18n();
  const isArabic = locale === 'ar';

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  
  // استخدام useRef للبيانات التي لا تحتاج لتحديث الواجهة مباشرة (لحل خطأ React)
  const isIOSRef = useRef(false);

  useEffect(() => {
    // 1. التحقق هل تم إخفاء الرسالة سابقاً
    const dismissed = window.localStorage.getItem('hantamap_install_dismissed') === 'true';

    // 2. التحقق هل الموقع مفتوح كتطبيق بالفعل
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // 3. التحقق من نوع الجهاز (جوال وآيفون)
    const ua = window.navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const ios = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);

    isIOSRef.current = ios;

    // إظهار الرسالة لمستخدمي الآيفون بتأخير بسيط لتجنب خطأ التحديث المتزامن (Synchronous setState)
    const timer = setTimeout(() => {
      if (mobile && !isApp && !dismissed && ios) {
        setShowBanner(true);
      }
    }, 500); // تأخير نصف ثانية لضمان تحميل الخريطة أولاً

    // التقاط حدث التثبيت لأجهزة الأندرويد
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (mobile && !isApp && !dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    // معالجة أجهزة الآيفون
    if (isIOSRef.current) {
      alert(
        isArabic
          ? 'لتثبيت التطبيق على الآيفون: اضغط على زر المشاركة [Share] أسفل الشاشة، ثم اختر [Add to Home Screen] أو [إضافة للشاشة الرئيسية].'
          : 'To install on iPhone: Tap the Share button at the bottom, then select "Add to Home Screen".'
      );
      return;
    }

    // معالجة أجهزة الأندرويد
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    window.localStorage.setItem('hantamap_install_dismissed', 'true');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'} 
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 bg-[#111] px-4 py-3 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-md animate-in slide-in-from-top-full duration-500"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-inner">
          <span className="text-white font-black tracking-tighter text-sm">HM</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-white truncate">
            {isArabic ? 'تثبيت HantaMap' : 'Install HantaMap'}
          </span>
          <span className="text-[10px] font-medium text-gray-400 truncate">
            {isArabic ? 'أضف المنصة لشاشتك الرئيسية' : 'Add tracker to your home screen'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-black text-black transition active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          {isArabic ? 'تثبيت' : 'Install'}
        </button>
        <button
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}