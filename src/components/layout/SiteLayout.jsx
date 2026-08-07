"use client";

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';

export default function SiteLayout({ children }) {
  const { t } = useLocale();
  return (
    <>
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] hidden md:block">
        <Link 
          href="/plan-your-trip" 
          className="bg-primary text-white py-8 px-2.5 rounded-r-2xl shadow-2xl flex items-center justify-center [writing-mode:vertical-lr] rotate-180 hover:bg-emerald-900 transition-all hover:pl-4 group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] group-hover:scale-110 transition-transform">
            {t.siteLayout.planTrips}
          </span>
        </Link>
      </div>

      {children}

      <div className="fixed bottom-8 left-8 z-[60]">
        <Link 
          href="/plan-trip" 
          className="bg-[#25D366] hover:bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="bg-white/20 p-1.5 rounded-full">
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest">{t.siteLayout.chatExpert}</span>
        </Link>
      </div>
    </>
  );
}
