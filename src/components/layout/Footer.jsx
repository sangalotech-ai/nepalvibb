"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Facebook, Instagram, Twitter,
  Mail, Phone, MapPin, ExternalLink,
  ShieldCheck, Globe, HelpCircle, Heart,
  ArrowRight, Youtube, Linkedin, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/providers/useLocale';

export default function Footer() {
  const [dynamicData, setDynamicData] = useState({
    destinations: [],
    activities: [],
    settings: null
  });
  const { t } = useLocale();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, actRes, setRes] = await Promise.all([
          fetch('/api/destinations'),
          fetch('/api/activities'),
          fetch('/api/admin/settings')
        ]);
        const dests = await destRes.json();
        const acts = await actRes.json();
        const settings = await setRes.json();
        setDynamicData({
          destinations: Array.isArray(dests) ? dests.slice(0, 5) : [],
          activities: Array.isArray(acts) ? acts.slice(0, 5) : [],
          settings: settings
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fallbackSettings = {
    address: 'Nygata 12, 0159 Oslo, Norge',
    kathmanduAddress: 'Thamel, Kathmandu, Nepal',
    contactEmail: 'info@nepalvibb.com',
    contactPhone: '+47 486 72 979',
    footerAbout: 'Nepalvibb er din personlige portal til Himalaya. Vi kobler deg med lokale eksperter for å skape uforglemmelige og bærekraftige reiseopplevelser i hjertet av Asia.',
    socialLinks: { facebook: '#', instagram: '#', youtube: '#', linkedin: '#' },
    affiliatedLabel: 'Vi er tilknyttet',
    subsidiaryLabel: 'Datterselskap av',
    subsidiaryLogo: '/uploads/actual-adventure-logo-np.svg',
    subsidiaryUrl: 'https://www.actual-adventure.com',
    visitingAddressLabel: 'Besøksadresse',
    callUsLabel: 'Ring Oss',
    callUsHours: 'Man-Fre: 09:00 - 17:00',
    sendEmailLabel: 'Send E-post',
    replyTimeLabel: 'Svar innen 24 timer',
    affiliations: [
      { name: 'NATTA', logoUrl: '/uploads/natta.png' },
      { name: 'NTB', logoUrl: '/uploads/ntb.svg' },
      { name: 'TAAN', logoUrl: '/uploads/taan.svg' },
      { name: 'NMA', logoUrl: '/uploads/nma.png' },
      { name: 'RGF', logoUrl: '/uploads/rgf.jpg' },
      { name: 'Keep Nepal Green', logoUrl: '/uploads/keep.svg' },
      { name: 'Government of Nepal', logoUrl: '/uploads/nepal-goverment.svg' }
    ],
    copyrightText: '© 2025 NEPALVIBB AS. ALL RIGHTS RESERVED.'
  };

  const s = dynamicData.settings ? {
    ...fallbackSettings,
    ...dynamicData.settings,
    affiliations: (dynamicData.settings.affiliations && dynamicData.settings.affiliations.length > 0)
      ? dynamicData.settings.affiliations
      : fallbackSettings.affiliations
  } : fallbackSettings;

  const footerLinks = [
    {
      title: t.footer.destinations,
      links: dynamicData.destinations.map(d => ({
        label: d.name,
        href: `/destination/${d.slug}`
      }))
    },
    {
      title: t.footer.topActivities,
      links: dynamicData.activities.map(a => ({
        label: a.name,
        href: `/activity/${a.slug}`
      }))
    },
    {
      title: t.footer.company,
      links: [
        { label: t.footer.about, href: '/om-oss' },
        { label: t.footer.blog, href: '/blogg' },
        { label: t.footer.career, href: '/karriere' },
        { label: t.footer.ourHistory, href: '/var-historie' },
      ]
    },
    {
      title: t.footer.support,
      links: [
        { label: t.footer.contactUs, href: '/kontakt-oss' },
        { label: t.footer.terms, href: '/betingelser' },
        { label: t.footer.privacy, href: '/personvern' },
        { label: t.footer.admin, href: '/admin/login' },
      ]
    }
  ];

  return (
    <footer className="bg-primary pt-32 pb-16 text-white relative overflow-hidden">
      {/* Decorative blurred background shapes to enhance glassmorphism */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Top Section: Branding & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20 border-b border-white/10">
          <div className="lg:col-span-4 space-y-10">
            <Link href="/" className="inline-block group">
              <img
                src="https://nepalvibb.com/wp-content/uploads/2025/05/logo-w.svg"
                alt="Nepalvibb"
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-stone-200/80 font-light leading-relaxed max-w-sm">
              {s.footerAbout}
            </p>
            <div className="flex items-center space-x-4">
              {[
                { icon: Facebook, href: s.socialLinks?.facebook },
                { icon: Instagram, href: s.socialLinks?.instagram },
                { icon: Youtube, href: s.socialLinks?.youtube },
                { icon: Linkedin, href: s.socialLinks?.linkedin }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-orange-500 border border-white/10 flex items-center justify-center text-white transition-all shadow-sm"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {footerLinks.map((column) => (
              <div key={column.title} className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">{column.title}</h4>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[11px] font-black text-stone-300 hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center group"
                      >
                        <span className="w-0 group-hover:w-3 h-[1px] bg-orange-400 mr-0 group-hover:mr-2 transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliations Section */}
        <div className="py-12 border-t border-b border-white/10 bg-white/5 -mx-6 px-6 lg:-mx-8 lg:px-8 my-12">
          <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300/80">
              {s.affiliatedLabel}
            </h5>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              {s.affiliations?.map((logo, i) => (
                <div
                  key={i}
                  className="group bg-white border border-transparent rounded-2xl p-4 flex items-center justify-center w-28 h-16 sm:w-36 sm:h-20 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300"
                >
<img 
                  src={logo.logoUrl}
                  alt={logo.name}
                  className="max-h-10 sm:max-h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subsidiary Section */}
        <div className="py-8 border-t border-b border-white/10 bg-black/25 -mx-6 px-6 lg:-mx-8 lg:px-8 my-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300/80">
              {s.subsidiaryLabel}
            </span>
            <a
              href={s.subsidiaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 px-6 py-3 rounded-2xl bg-green-900 hover:shadow-md transition-all duration-300 border border-transparent hover:border-orange-500/20 shadow-sm"
            >
<img 
                    src={s.subsidiaryLogo}
                    alt={s.name}
                    className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                  />
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:text-orange-500 transition-colors" />
            </a>
          </div>
        </div>

        {/* Support Section */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10">
          <div className="flex space-x-6 items-start bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/90 mb-3">
                {t.footer.visitingAddress}
              </h5>
              <div className="text-sm font-medium text-stone-200/90 leading-relaxed">
                <p>{s.address}</p>
                {s.kathmanduAddress && <p className="mt-1 opacity-60">{s.kathmanduAddress}</p>}
              </div>
            </div>
          </div>
          <div className="flex space-x-6 items-start bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/90 mb-3">
                {t.footer.callUs}
              </h5>
              <p className="text-sm font-medium text-stone-200/90 leading-relaxed">
                {s.contactPhone}<br />
                <span className="opacity-60">{t.footer.callUsHours}</span>
              </p>
            </div>
          </div>
          <div className="flex space-x-6 items-start bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/90 mb-3">
                {t.footer.sendEmail}
              </h5>
              <p className="text-sm font-medium text-stone-200/90 leading-relaxed">
                {s.contactEmail}<br />
                <span className="opacity-60">{t.footer.replyTime}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Badges */}
        <div className="pt-16 flex flex-col md:flex-row items-center justify-between gap-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {s.copyrightText}
            </p>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <div className="flex items-center space-x-6">
              <Link href="/betingelser" className="text-[10px] font-black text-stone-300 hover:text-white transition-colors uppercase tracking-widest">{t.footer.terms}</Link>
              <Link href="/personvern" className="text-[10px] font-black text-stone-300 hover:text-white transition-colors uppercase tracking-widest">{t.footer.privacy}</Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl space-x-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">{t.footer.securePayment}</span>
            </div>
            <div className="flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl space-x-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
              <Globe className="w-4 h-4 text-orange-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">{t.footer.memberOfRGF}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
