"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/components/providers/useLocale';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const { t } = useLocale();
  const [content, setContent] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, settingsRes] = await Promise.all([
          fetch('/api/contact-content'),
          fetch('/api/admin/settings')
        ]);
        const contentData = await contentRes.json();
        const settingsData = await settingsRes.json();
        setContent(contentData);
        setSettings(settingsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      
      {/* Cinematic Hero */}
      <section className="relative pt-44 pb-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs">
              {content?.hero?.subtitle || t.contact.heroSubtitle}
            </h5>
            <h1 className="text-4xl md:text-7xl font-bold font-display text-white tracking-tight leading-tight">
              {content?.hero?.title || t.contact.heroTitle}
            </h1>
            <p className="text-emerald-100/80 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed">
              {content?.hero?.description || t.contact.heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight">
                {content?.form?.title || t.contact.formTitle}
              </h2>
              <p className="text-gray-500 font-light text-sm">
                {content?.form?.subtitle || t.contact.formSubtitle}
              </p>
            </div>
 
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">{t.contact.formName}</label>
                <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">{t.contact.formEmail}</label>
                <input type="email" className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">{t.contact.formMessage}</label>
                <textarea rows={6} className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
              </div>
              <div className="md:col-span-2">
                <button className="bg-orange-500 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-orange-600 hover:scale-105 transition-all flex items-center space-x-2">
                  <span>{t.contact.formSubmit}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
 
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-primary p-8 sm:p-10 rounded-3xl text-white space-y-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe className="w-24 h-24" />
              </div>
              
              <h3 className="text-xl font-bold font-display text-white tracking-tight">{t.contact.infoTitle}</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                      {settings?.visitingAddressLabel || t.contact.visitingAddressLabel}
                    </p>
                    <p className="text-sm font-light leading-relaxed">
                      {settings?.address}<br />
                      {settings?.kathmanduAddress && <span className="opacity-60">{t.contact.nepal}: {settings.kathmanduAddress}</span>}
                    </p>
                  </div>
                </div>
 
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                      {settings?.callUsLabel || t.contact.callUsLabel}
                    </p>
                    <p className="text-lg font-bold">{settings?.contactPhone}</p>
                    <p className="text-[10px] font-light text-white/50 uppercase tracking-wider mt-0.5">
                      {settings?.callUsHours || t.contact.callUsHours}
                    </p>
                  </div>
                </div>
 
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                      {settings?.sendEmailLabel || t.contact.sendEmailLabel}
                    </p>
                    <p className="text-lg font-bold">{settings?.contactEmail}</p>
                  </div>
                </div>
              </div>
 
              <div className="pt-6 border-t border-white/10">
                 <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <Clock className="w-4 h-4" />
                    <span>{settings?.replyTimeLabel || t.contact.replyTimeLabel}</span>
                 </div>
              </div>
            </div>
 
            {/* Support Box */}
            <a 
              href={`https://wa.me/${settings?.whatsapp || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 sm:p-8 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-lg transition-all block"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary tracking-tight">{t.contact.chatTitle}</h4>
                  <p className="text-xs text-gray-400 font-light">{t.contact.chatSubtitle}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
