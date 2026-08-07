"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Send, Map } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';

export default function FloatingUI() {
  const { t } = useLocale();
  return (
    <>
      {/* Global Floating Side Tab */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] hidden md:block group">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link 
            href="/plan-your-trip" 
            className="relative flex items-center"
          >
            <div className="bg-primary text-white py-10 px-3 rounded-r-[2rem] shadow-[10px_0_30px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center hover:pl-6 transition-all duration-500 group overflow-hidden border-y border-r border-white/10">
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite]" />
              
              <Map className="w-4 h-4 mb-4 text-orange-400 group-hover:scale-125 transition-transform" />
              
              <span className="text-[10px] font-black uppercase tracking-[0.5em] [writing-mode:vertical-lr] rotate-180">
                {t.siteLayout.planTrips}
              </span>

              <Sparkles className="w-3 h-3 mt-4 text-emerald-300 animate-pulse" />
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-4 bg-white shadow-2xl rounded-2xl p-4 w-48 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 pointer-events-none border border-gray-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t.floatingTooltip.expertPlanning}</p>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{t.floatingTooltip.tooltipDesc}</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-10 right-10 z-[60]">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Link 
            href="/plan-your-trip" 
            className="flex items-center group"
          >
            {/* Pulsing Aura */}
            <div className="absolute inset-0 bg-[#25D366] rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity" />
            
            <div className="relative bg-white border border-gray-100 pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center space-x-4 backdrop-blur-xl group-hover:border-primary/20 transition-all">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-0.5 flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                  {t.common.onlineNow}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-primary">{t.floatingTooltip.chatExpert}</span>
              </div>
              
              <div className="bg-gradient-to-tr from-primary to-emerald-400 p-3.5 rounded-full text-white shadow-lg group-hover:shadow-emerald-500/30 transition-all relative overflow-hidden">
                <MessageCircle className="w-5 h-5 fill-white group-hover:scale-110 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </div>
            </div>

            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-lg">
              1
            </div>
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>
    </>
  );
}
