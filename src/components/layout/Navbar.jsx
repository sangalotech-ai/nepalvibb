"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu, X, Phone, Mail, ChevronDown, Globe, Search, User, LogOut, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/providers/useLocale';

const WhatsAppIcon = ({ size = 16, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" {...props}>
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
  </svg>
);

const ViberIcon = ({ size = 16, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 24 24" {...props}>
    <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.13 8.95 5.5 10.541v2.42s-.038.97.602 1.17c.79.25 1.24-.499 1.99-1.299l1.4-1.58c3.85.32 6.8-.419 7.14-.529.78-.25 5.181-.811 5.901-6.652.74-6.031-.36-9.831-2.34-11.551l-.01-.002c-.6-.55-3-2.3-8.37-2.32 0 0-.396-.025-1.038-.016zm.067 1.697c.545-.003.88.02.88.02 4.54.01 6.711 1.38 7.221 1.84 1.67 1.429 2.528 4.856 1.9 9.892-.6 4.88-4.17 5.19-4.83 5.4-.28.09-2.88.73-6.152.52 0 0-2.439 2.941-3.199 3.701-.12.13-.26.17-.35.15-.13-.03-.17-.19-.16-.41l.02-4.019c-4.771-1.32-4.491-6.302-4.441-8.902.06-2.6.55-4.732 2-6.172 1.957-1.77 5.475-2.01 7.11-2.02z"/>
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dynamicActivities, setDynamicActivities] = useState([]);
  const [settings, setSettings] = useState(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { locale, t, setLocale } = useLocale();
  const isNo = locale === 'no';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actRes, setRes] = await Promise.all([
          fetch('/api/activities'),
          fetch('/api/admin/settings')
        ]);
        const acts = await actRes.json();
        const sets = await setRes.json();
        setDynamicActivities(Array.isArray(acts) ? acts : []);
        setSettings(sets);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: '/' },
    {
      name: t.nav.destinations,
      dropdown: [
        { name: isNo ? 'Nepal' : 'Nepal', href: '/destination/nepal' },
        { name: 'India', href: '/destination/india' },
        { name: 'Bhutan', href: '/destination/bhutan' },
        { name: 'Tibet', href: '/destination/tibet' },
      ]
    },
    {
      name: t.nav.activities,
      dropdown: dynamicActivities.map(a => ({
        name: a.name,
        href: `/activity/${a.slug}`
      }))
    },
    {
      name: t.nav.company,
      dropdown: [
        { name: t.nav.about, href: '/om-oss' },
        { name: t.nav.blog, href: '/blogg' },
        { name: t.nav.contact, href: '/kontakt-oss' },
      ]
    },
  ];

  const contactEmail = settings?.contactEmail || 'info@nepalvibb.com';
  const contactPhone = settings?.contactPhone || '+47 48672979';
  const whatsapp = settings?.whatsapp || '4748672979';
  const viber = settings?.viber || '4748672979';

  return (
    <header className="fixed w-full z-[100] transition-all duration-500">
      <div className={cn(
        "bg-primary text-white py-2 transition-all duration-500 ",
        isScrolled ? "hidden sm:block" : "block"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center sm:justify-between items-center text-[9px] sm:text-[11px] font-medium tracking-wider">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <a href={`mailto:${contactEmail}`} className="flex items-center hover:text-orange-400 transition-colors group">
              <Mail className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" />
              <span className="opacity-80 truncate max-w-[120px] sm:max-w-none">{contactEmail}</span>
            </a>
            <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center hover:text-orange-400 transition-colors group">
              <Phone className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" />
              <span className="opacity-80">{contactPhone}</span>
            </a>
            <div className="hidden lg:flex items-center space-x-6 pl-6 border-l border-white/10">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-emerald-400 transition-all group">
                <WhatsAppIcon className="w-3.5 h-3.5 mr-2 group-hover:scale-125 transition-transform" />
                <span className="opacity-80">WhatsApp</span>
              </a>
              <a href={`viber://chat?number=%2B${viber}`} className="flex items-center hover:text-purple-400 transition-all group">
                <ViberIcon className="w-3.5 h-3.5 mr-2 group-hover:scale-125 transition-transform" />
                <span className="opacity-80">Viber</span>
              </a>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-emerald-300">
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase text-[9px] font-black tracking-[0.2em]">{t.nav.support247}</span>
            </div>
            <div className="flex items-center space-x-3 border-l border-white/10 pl-6 ml-6">
              <button
                onClick={() => setLocale('no')}
                aria-label="Norsk"
                className={cn("hover:scale-125 transition-transform", !isNo && "opacity-50")}
              >
                🇳🇴
              </button>
              <button
                onClick={() => setLocale('en')}
                aria-label="English"
                className={cn("hover:scale-125 transition-transform", isNo && "opacity-50")}
              >
                🇬🇧
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={cn(
        "transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-2xl py-3 border-b border-gray-100"
          : "bg-black/20 backdrop-blur-[2px] py-6"
      )}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-full">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <img
                src="https://nepalvibb.com/wp-content/uploads/2025/05/logo-w.svg"
                alt="Nepalvibb Logo"
                className={cn(
                  "h-12 w-auto transition-all duration-500",
                  isScrolled ? "brightness-0" : "brightness-100"
                )}
                fetchPriority="high"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative group py-2"
                  onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {link.dropdown ? (
                    <button className={cn(
                      "text-[11px] font-black uppercase tracking-[0.25em] flex items-center transition-all duration-300 cursor-pointer",
                      isScrolled ? "text-gray-800" : "text-white",
                      activeDropdown === link.name && "text-orange-500"
                    )}>
                      {link.name}
                      <ChevronDown className={cn(
                        "ml-1.5 w-3.5 h-3.5 transition-transform duration-300",
                        activeDropdown === link.name && "rotate-180"
                      )} />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 relative py-1",
                        isScrolled ? "text-gray-800" : "text-white",
                        pathname === link.href ? "text-orange-500" : "hover:text-orange-400"
                      )}
                    >
                      {link.name}
                      {pathname === link.href && (
                        <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500" />
                      )}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {link.dropdown && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full -left-6 w-64 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl py-6 mt-4 z-[110] border border-gray-100 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-orange-500" />
                        {link.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-8 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-700 hover:bg-emerald-50 hover:text-primary transition-all flex items-center group/item"
                          >
                            <span className="w-0 group-hover/item:w-3 h-0.5 bg-orange-500 mr-0 group-hover/item:mr-3 transition-all duration-300" />
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <Link
                href="/plan-your-trip"
                className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-8 py-4 rounded-full transition-all uppercase tracking-[0.25em] shadow-2xl hover:shadow-orange-500/30 active:scale-95 flex items-center group"
              >
                <Search className="w-3.5 h-3.5 mr-2.5 group-hover:scale-110 transition-transform" />
                {t.nav.planTrip}
              </Link>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4 pl-6 border-l border-gray-100/20">
                {status === 'authenticated' ? (
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/dashboard" 
                      className={cn(
                        "flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors",
                        isScrolled ? "text-gray-800" : "text-white"
                      )}
                    >
                      <Layout className="w-4 h-4" />
                      <span>{t.nav.myDashboard}</span>
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className={cn(
                        "flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors",
                        isScrolled ? "text-gray-800" : "text-white"
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className={cn(
                      "flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors",
                      isScrolled ? "text-gray-800" : "text-white"
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span>{t.nav.logIn}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "p-2 rounded-xl transition-all active:scale-90",
                  isScrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"
                )}
              >
                {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-8 py-12 space-y-8">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 font-display">{link.name}</p>
                        {link.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block text-xl font-black text-primary uppercase tracking-tighter font-display"
                            onClick={() => setIsOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className="block text-3xl font-black text-primary uppercase tracking-tighter font-display"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
                <Link
                  href="/plan-your-trip"
                  className="block bg-orange-500 text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
                  onClick={() => setIsOpen(false)}
                >
                  {t.nav.planTripLower}
                </Link>

                <div className="pt-8 border-t border-gray-100">
                  {status === 'authenticated' ? (
                    <div className="space-y-4">
                       <Link 
                        href="/dashboard" 
                        className="flex items-center space-x-4 text-xl font-black text-primary uppercase tracking-tighter font-display"
                        onClick={() => setIsOpen(false)}
                      >
                        <Layout className="w-6 h-6" />
                        <span>{t.nav.myDashboard}</span>
                      </Link>
                      <button 
                        onClick={() => signOut()}
                        className="flex items-center space-x-4 text-xl font-black text-red-500 uppercase tracking-tighter font-display"
                      >
                        <LogOut className="w-6 h-6" />
                        <span>{t.nav.logOut}</span>
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/login" 
                      className="flex items-center space-x-4 text-2xl font-black text-primary uppercase tracking-tighter font-display"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-7 h-7" />
                      <span>{t.nav.logIn}</span>
                    </Link>
                  )}
                </div>

                <div className="pt-8 border-t border-gray-100 flex items-center space-x-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 font-display">Language</span>
                  <button
                    onClick={() => setLocale('no')}
                    className={cn("text-2xl transition-transform", !isNo && "opacity-40")}
                  >
                    🇳🇴 <span className="text-sm text-gray-500 font-bold uppercase">Norsk</span>
                  </button>
                  <button
                    onClick={() => setLocale('en')}
                    className={cn("text-2xl transition-transform", isNo && "opacity-40")}
                  >
                    🇬🇧 <span className="text-sm text-gray-500 font-bold uppercase">English</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
