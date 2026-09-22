"use client";

import { useState, useEffect, use } from 'react';
import { 
  Clock, Globe, User, Users, Star, Check, CheckCircle,
  MapPin, MessageCircle, ArrowRight, Shield,
  Share2, Heart, Printer, ChevronRight, ChevronLeft, X,
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip ? tr(trip, 'title', locale) : '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(locale === 'en' ? 'Link copied to clipboard!' : 'Lenke kopiert til utklippstavlen!');
    }
  };

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

  const allImages = trip ? [trip.image, ...(trip.gallery || [])].filter(Boolean) : [];

  useEffect(() => {
    if (!isLightboxOpen || allImages.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  useEffect(() => {
    if (allImages.length <= 1 || isLightboxOpen) return;

    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [allImages.length, isLightboxOpen]);

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
      
      {/* Sliding Hero Banner */}
      <section className="relative h-[65vh] md:h-[80vh] min-h-[450px] overflow-hidden group bg-gray-900">
        {/* Slideshow Images */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={() => {
            setActivePhotoIndex(bannerIndex);
            setIsLightboxOpen(true);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={bannerIndex}
              src={allImages[bannerIndex]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full h-full object-cover select-none"
              alt={tr(trip, 'title', locale)}
              fetchPriority={bannerIndex === 0 ? "high" : "low"}
            />
          </AnimatePresence>
        </div>

        {/* Gradient dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 pointer-events-none" />

        {/* Floating Breadcrumbs / Category (top-left) */}
        <div className="absolute top-6 left-6 hidden sm:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-white/70 z-10 bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm">
          <Link href="/" className="hover:text-white transition-colors">
            {locale === 'en' ? 'Home' : 'Hjem'}
          </Link>
          <ChevronRight className="w-3 h-3 text-white/40" />
          <Link href="/trips" className="hover:text-white transition-colors">
            {locale === 'en' ? 'Trips' : 'Turer'}
          </Link>
          <ChevronRight className="w-3 h-3 text-white/40" />
          <span className="text-orange-400">
            {locale === 'en'
              ? (trip.categoryEn?.[0] || trip.category?.[0])
              : (trip.category?.[0])}
          </span>
        </div>

        {/* Floating Share/Save top-right on banner */}
        <div className="absolute top-6 right-6 flex items-center space-x-3 z-10">
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm"
          >
            <Share2 className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">{locale === 'en' ? 'Share' : 'Del'}</span>
          </button>
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2.5 border text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm",
              isSaved 
                ? "bg-red-500/25 border-red-500/30 text-red-200" 
                : "bg-black/40 border-white/10 hover:bg-black/60"
            )}
          >
            <Heart className={cn("w-4 h-4", isSaved ? "fill-red-500 text-red-400" : "text-white/80")} />
            <span>{isSaved ? (locale === 'en' ? 'Saved' : 'Lagret') : (locale === 'en' ? 'Save' : 'Lagre')}</span>
          </button>
        </div>

        {/* Slide Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setBannerIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/60 border border-white/15 text-white transition-all opacity-0 group-hover:opacity-100 z-10 active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setBannerIndex((prev) => (prev + 1) % allImages.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/60 border border-white/15 text-white transition-all opacity-0 group-hover:opacity-100 z-10 active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Banner Details Overlay (Bottom) */}
        <div className="absolute inset-x-0 bottom-0 flex items-end pb-12 md:pb-16 pt-32 pointer-events-none">
          <div className="max-w-[85rem] mx-auto px-6 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="max-w-4xl space-y-4 pointer-events-auto"
            >
              <span className="inline-block bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                {locale === 'en'
                  ? (trip.categoryEn?.[0] || trip.category?.[0])
                  : (trip.category?.[0])}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-tight drop-shadow-sm">
                {tr(trip, 'title', locale)}
              </h1>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-white/90 text-xs font-semibold tracking-wide">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-orange-400" /> {tr(trip, 'duration', locale)}</span>
                <span className="flex items-center"><Mountain className="w-4 h-4 mr-2 text-orange-400" /> {tr(trip, 'difficulty', locale)}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-orange-400" /> {tr(trip, 'destination', locale)}</span>
              </div>
            </motion.div>

            {/* Photo Counter / Action Button (Bottom Right) */}
            <div className="pointer-events-auto flex items-center gap-3">
              {allImages.length > 1 && (
                <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-white/10 px-3.5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm select-none">
                  {bannerIndex + 1} / {allImages.length}
                </div>
              )}
              <button 
                onClick={() => {
                  setActivePhotoIndex(bannerIndex);
                  setIsLightboxOpen(true);
                }}
                className="bg-white hover:bg-gray-50 border border-gray-200 text-primary font-bold uppercase tracking-wider text-[10px] px-5 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer z-10"
              >
                <Camera className="w-4 h-4 text-orange-500" />
                <span>{t.tripDetail.showAllPhotos} ({allImages.length})</span>
              </button>
            </div>
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
                <div 
                  key={i} 
                  className="h-64 md:h-72 rounded-2xl overflow-hidden shadow-sm cursor-pointer group"
                  onClick={() => {
                    setActivePhotoIndex(i + 1);
                    setIsLightboxOpen(true);
                  }}
                >
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col justify-between"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center px-6 py-4 text-white z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {activePhotoIndex + 1} {t.tripDetail.photoOf} {allImages.length}
              </span>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image Slider Area */}
            <div className="flex-1 flex items-center justify-between px-4 sm:px-8 md:px-16 relative">
              {/* Prev Button */}
              <button 
                onClick={() => setActivePhotoIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Centered Image Container */}
              <div className="relative max-w-4xl max-h-[70vh] flex items-center justify-center overflow-hidden px-4 select-none">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activePhotoIndex}
                    src={allImages[activePhotoIndex]} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" 
                    alt="" 
                  />
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button 
                onClick={() => setActivePhotoIndex((prev) => (prev + 1) % allImages.length)}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Thumbnail Strip */}
            <div className="w-full bg-black/60 border-t border-white/5 py-4 px-6 overflow-x-auto no-scrollbar flex justify-center gap-3">
              <div className="flex gap-2 mx-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={cn(
                      "w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all cursor-pointer border-2",
                      activePhotoIndex === idx ? "border-orange-500 scale-105 opacity-100 shadow-lg" : "border-transparent opacity-50 hover:opacity-80"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
