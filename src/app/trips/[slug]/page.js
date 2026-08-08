"use client";

import { useState, useEffect, use } from 'react';
import { 
  Clock, Globe, User, Users, Star, Check, CheckCircle,
  MapPin, MessageCircle, ArrowRight, Shield,
  Share2, Heart, Printer, ChevronRight,
  Info, Compass, Home, Tag, Calendar,
  Mountain, Wind, Zap, ShieldCheck, XCircle,
  Camera, Utensils, Bed, CreditCard, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tr, trItem } from '@/lib/tr';
import Navbar from '@/components/layout/Navbar';
import ReviewSection from '@/components/trips/ReviewSection';
import { useLocale } from '@/components/providers/useLocale';

export default function TripDetailPage({ params }) {
  const { t, locale } = useLocale();
  const { slug } = use(params);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('oversikt');

  const tabs = [
    { id: 'oversikt', label: t.tripDetail.tabOverview },
    { id: 'turdetaljer', label: t.tripDetail.tabDetails },
    { id: 'reiserute', label: t.tripDetail.tabItinerary },
    { id: 'tjenester', label: t.tripDetail.tabIncluded },
    { id: 'galleri', label: t.tripDetail.tabGallery },
    { id: 'info', label: t.tripDetail.tabInfo },
    { id: 'omtaler', label: t.tripDetail.tabReviews },
  ];

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/trips/${slug}`);
        if (!res.ok) throw new Error('Trip not found');
        const data = await res.json();
        setTrip(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [slug]);

  useEffect(() => {
    if (loading || !trip) return;

    const observerOptions = {
      root: null,
      rootMargin: '-150px 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [loading, trip]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 150;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Navbar />
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-44 space-y-6">
        <Zap className="w-10 h-10 text-red-500" />
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight">{t.tripDetail.notFoundTitle}</h1>
        <Link href="/" className="bg-primary text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-orange-500 shadow-md">
          {t.tripDetail.backHome}
        </Link>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-[#FAFAF9] selection:bg-orange-500 selection:text-white">
      <Navbar />
      
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] md:h-[75vh] min-h-[400px] overflow-hidden">
        <img src={trip.image} className="w-full h-full object-cover" alt={tr(trip, 'title', locale)} fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[85rem] mx-auto px-6 pb-12 md:pb-16 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
              <span className="inline-block bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                {locale === 'en'
                  ? (trip.categoryEn?.[0] || trip.category?.[0])
                  : (trip.category?.[0])}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-tight">
                {tr(trip, 'title', locale)}
              </h1>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-white/90 text-xs font-medium tracking-wide">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-orange-500" /> {tr(trip, 'duration', locale)}</span>
                <span className="flex items-center"><Mountain className="w-4 h-4 mr-2 text-orange-500" /> {tr(trip, 'difficulty', locale)}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-orange-500" /> {tr(trip, 'destination', locale)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scrollspy Navigation */}
      <div className="sticky top-[80px] z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[85rem] mx-auto px-6 flex justify-between items-center py-4">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider transition-all relative pb-2 whitespace-nowrap",
                  activeSection === tab.id ? "text-primary" : "text-gray-400 hover:text-primary"
                )}
              >
                {tab.label}
                {activeSection === tab.id && <motion.div layoutId="activeSection" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
              </button>
            ))}
          </div>
          <Link href={`/plan-your-trip?tour=${slug}&dest=${tr(trip, 'destination', locale)}`} className="hidden md:block bg-orange-500 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-orange-600 transition-all">{t.tripDetail.bookTrip}</Link>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="max-w-[85rem] mx-auto px-6 py-12 md:py-16 flex flex-col lg:flex-row gap-10 lg:gap-12">
        <div className="lg:w-2/3 space-y-12 md:space-y-16">
          
          {/* Oversikt Section */}
          <section id="oversikt" className="scroll-mt-36 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">{t.tripDetail.overviewTitle}</h2>
              <div 
                className="prose prose-primary max-w-none text-gray-600 font-light leading-relaxed prose-p:text-sm md:prose-p:base prose-p:mb-4 prose-strong:font-semibold" 
                dangerouslySetInnerHTML={{ __html: tr(trip, 'overview', locale) || tr(trip, 'summary', locale) }} 
              />
            </div>

            {(locale === 'en' ? (trip.highlightsEn?.length ? trip.highlightsEn : trip.highlights) : trip.highlights)?.length > 0 && (
              <div className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                <h3 className="text-xl font-bold font-display text-primary tracking-tight flex items-center">
                  <Star className="w-5 h-5 mr-3 text-orange-500 fill-current" /> {t.tripDetail.highlightsTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {(locale === 'en' ? (trip.highlightsEn?.length ? trip.highlightsEn : trip.highlights) : trip.highlights).map((h, i) => (
                    <div key={i} className="flex items-start space-x-3 group">
                      <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 leading-tight">{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Turdetaljer Section */}
          {trip.tripDetails?.length > 0 && (
            <section id="turdetaljer" className="scroll-mt-36 space-y-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">{t.tripDetail.detailsTitle}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {trip.tripDetails.map((detail, i) => {
                  const Icon = ({
                    Clock: Clock,
                    Globe: Globe,
                    User: User,
                    MapPin: MapPin,
                    Mountain: Mountain,
                    Users: Users,
                    Zap: Zap,
                    Shield: Shield,
                    Compass: Compass,
                    Home: Home,
                    Calendar: Calendar,
                  }[detail.icon] || Info);
                  
                  return (
                    <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100/50 space-y-3 hover:bg-white hover:shadow-md transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                        <Icon className="w-5 h-5 text-orange-500 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{trItem(detail, 'label', locale)}</h4>
                        <p className="text-sm font-bold text-primary">{trItem(detail, 'value', locale)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Reiserute Section */}
          <section id="reiserute" className="scroll-mt-36 space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">{t.tripDetail.itineraryTitle}</h2>
            <div className="space-y-6 relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-100 hidden md:block" />
              {(trip.itinerary || []).map((item, idx) => (
                <div key={idx} className="relative md:pl-16 group">
                  <div className="absolute left-0 top-1 w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-bold text-primary text-sm shadow-sm group-hover:bg-primary group-hover:text-white transition-all hidden md:flex z-10">{item.day}</div>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 hover:shadow-md transition-all">
                    <h3 className="text-base font-bold font-display text-primary mb-2">{trItem(item, 'title', locale)}</h3>
                    <div 
                      className="prose prose-primary max-w-none text-gray-600 font-light prose-p:text-xs md:prose-p:sm prose-p:leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: trItem(item, 'details', locale) }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tjenester Section */}
          <section id="tjenester" className="scroll-mt-36 space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">{t.tripDetail.includedTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 space-y-4">
                <h3 className="text-base font-bold font-display text-emerald-700 tracking-tight flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600" /> {t.tripDetail.priceIncludes}</h3>
                <ul className="space-y-2">
                  {(locale === 'en' ? (trip.priceIncludesEn?.length ? trip.priceIncludesEn : trip.priceIncludes) : trip.priceIncludes)?.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs font-medium text-emerald-800/80 leading-relaxed">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50/30 p-6 rounded-3xl border border-red-100/50 space-y-4">
                <h3 className="text-base font-bold font-display text-red-700 tracking-tight flex items-center"><XCircle className="w-4 h-4 mr-2 text-red-600" /> {t.tripDetail.priceExcludes}</h3>
                <ul className="space-y-2">
                  {(locale === 'en' ? (trip.priceExcludesEn?.length ? trip.priceExcludesEn : trip.priceExcludes) : trip.priceExcludes)?.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs font-medium text-red-800/80 leading-relaxed">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Galleri Section */}
          <section id="galleri" className="scroll-mt-36 space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">{t.tripDetail.galleryTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {trip.gallery?.map((img, i) => (
                <div key={i} className="h-64 md:h-72 rounded-2xl overflow-hidden shadow-sm">
                  <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </section>

          {/* Info Section */}
          <section id="info" className="scroll-mt-36 space-y-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-primary tracking-tight">{t.tripDetail.infoTitle}</h2>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-100">
              {[
                { label: t.tripDetail.infoBestTime, value: tr(trip.usefulInfo, 'bestTime', locale) },
                { label: t.tripDetail.infoAccommodation, value: tr(trip.usefulInfo, 'accommodation', locale) },
                { label: t.tripDetail.infoMeals, value: tr(trip.usefulInfo, 'meals', locale) },
                { label: t.tripDetail.infoVisa, value: tr(trip.usefulInfo, 'visaInfo', locale) },
                { label: t.tripDetail.infoPackingList, value: tr(trip.usefulInfo, 'packingList', locale) },
              ].map((item, i) => item.value && (
                <div key={i} className="flex items-start gap-6 px-8 py-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 min-w-[140px] pt-0.5">{item.label}</span>
                  <span className="text-sm font-medium text-primary leading-relaxed">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Omtaler Section */}
          <ReviewSection tripId={trip._id} />
        </div>

        {/* Sidebar */}
        <aside className="lg:w-1/3">
          <div className="sticky top-36 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t.tripDetail.priceFromOnly}</p>
                <p className="text-4xl font-bold font-display text-primary tracking-tight">NOK {trip.price?.toLocaleString()}</p>
              </div>
              <div className="space-y-3">
                <Link href={`/plan-your-trip?tour=${slug}&dest=${tr(trip, 'destination', locale)}`} className="block bg-orange-500 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm hover:bg-orange-600 transition-all text-center">{t.tripDetail.bookNow}</Link>
                <Link href={`/plan-your-trip?tour=${slug}&dest=${tr(trip, 'destination', locale)}`} className="block border border-gray-200 py-4 rounded-xl font-bold uppercase tracking-wider text-xs hover:border-primary transition-all text-center text-primary">{t.tripDetail.talkToExpert}</Link>
              </div>
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-center space-x-2.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-orange-500" /> <span>{t.tripDetail.securePayment}</span>
                </div>
                <div className="flex items-center justify-center space-x-2.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  <Globe className="w-4 h-4 text-orange-500" /> <span>{t.tripDetail.localExperts}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
