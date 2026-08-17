"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar, Users, MapPin, Compass,
  Send, ChevronRight, ChevronLeft, CheckCircle2,
  Mountain, Landmark, Heart, Sparkles, Layout, Mail, User, MessageSquare, Globe, Zap,
  MessageCircle, ArrowUp, ChevronDown, Check, Info, Shield, Star, Edit2, Lock
} from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

const IconMap = {
  MapPin, Mountain, Landmark, Heart, Sparkles, Calendar, Users, Send, Mail, User, MessageSquare, Globe, Zap, Compass, Layout, Star
};

const DEFAULT_QUESTIONS = [
  {
    _id: 'def-1',
    question: 'Din gruppestørrelse',
    description: 'Hvem skal du reise sammen med?',
    type: 'select',
    options: [
      { label: 'Solo', value: 'solo', icon: 'User' },
      { label: 'Par', value: 'couple', icon: 'Users' },
      { label: 'Familie', value: 'family', icon: 'Users' },
      { label: 'Gruppe', value: 'group', icon: 'Users' }
    ]
  },
  {
    _id: 'def-2',
    question: 'Reisedatoer',
    description: 'Når planlegger du å besøke Himalaya?',
    type: 'select',
    options: [
      { label: 'Fleksibel', value: 'flexible', icon: 'Calendar' },
      { label: 'Spesifikke datoer', value: 'fixed', icon: 'Calendar' },
      { label: 'Vår (Mars-Mai)', value: 'spring', icon: 'Calendar' },
      { label: 'Høst (Sept-Nov)', value: 'autumn', icon: 'Calendar' }
    ]
  },
  {
    _id: 'def-3',
    question: 'Turdetaljer',
    description: 'Vennligst oppgi detaljer om din ønskede tur.',
    type: 'text',
    options: [
      { 
        label: 'Komfortabel', 
        value: 'comfortable', 
        icon: 'Heart',
        description: 'Tilsvarer 3-stjerners hotell. Vi vil tilstrebe å tilby komfortabel, men ikke luksuriøs overnatting.' 
      },
      { 
        label: 'Luksus', 
        value: 'luxury', 
        icon: 'Sparkles',
        description: 'Tilsvarer 4-stjerners hotell og over. Vi tilbyr den beste luksuriøse overnattingen tilgjengelig gjennom hele turen.' 
      },
      { 
        label: 'Luksus Pluss', 
        value: 'luxury-plus', 
        icon: 'Sparkles',
        description: 'Tilsvarer 5-stjerners hotell eller mer, vi tilbyr den beste luksuriøse overnattingen tilgjengelig gjennom hele turen.' 
      },
      { 
        label: 'Camping', 
        value: 'camping', 
        icon: 'Mountain',
        description: 'Du vil få en annerledes opplevelse.' 
      }
    ]
  }
];

function DateField({ label, value, min, onChange }) {
  const { t } = useLocale();
  const handleBoxClick = (e) => {
    const input = e.currentTarget.querySelector('input[type="date"]');
    if (input) input.showPicker();
  };
  return (
    <div className="relative group" onClick={handleBoxClick}>
      <div className="flex items-center space-x-2 text-gray-400 mb-3">
        <Calendar className="w-4 h-4" />
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-[2rem] px-8 py-5 text-sm font-bold text-gray-800 shadow-sm cursor-pointer transition-all hover:border-primary/30 group-hover:bg-white">
        {value ? new Date(value).toLocaleDateString('no-NO', { day: '2-digit', month: 'long', year: 'numeric' }) : t.planTrip.selectDate}
      </div>
      <input type="date" value={value || ''} min={min} onChange={e => onChange(e.target.value)} className="sr-only" />
    </div>
  );
}

function PlanYourTripContent() {
  const { t, locale } = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourParam = searchParams.get('tour') || searchParams.get('slug');
  const destParam = searchParams.get('dest');
  const [questions, setQuestions] = useState([]);
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [createdTripId, setCreatedTripId] = useState(null);

  const [responses, setResponses] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trip_responses");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [error, setError] = useState('');

  const [contactInfo, setContactInfo] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("trip_contact");
      return saved ? JSON.parse(saved) : { name: '', email: '', password: '' };
    }
    return { name: '', email: '', password: '' };
  });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setContactInfo(prev => ({
        ...prev,
        name: session.user.name || prev.name || '',
        email: session.user.email || prev.email || ''
      }));
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('trip_responses', JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem('trip_contact', JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
    const savedStep = localStorage.getItem('trip_step');
    if (savedStep) {
      const parsed = parseInt(savedStep);
      if (!isNaN(parsed)) {
        setCurrentStepIdx(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentStepIdx >= questions.length + 1) {
      setCurrentStepIdx(0);
    }
  }, [questions, currentStepIdx]);

  useEffect(() => {
    localStorage.setItem('trip_step', currentStepIdx.toString());
  }, [currentStepIdx]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, tRes, dRes, aRes] = await Promise.all([
          fetch('/api/plan-trip/questions'),
          fetch('/api/trips?limit=1000'),
          fetch('/api/destinations'),
          fetch('/api/activities')
        ]);
        const [qData, tData, dData, aData] = await Promise.all([
          qRes.json(), tRes.json(), dRes.json(), aRes.json()
        ]);
        const filtered = Array.isArray(qData)
          ? qData.filter(q => {
              const title = q.question?.toLowerCase() || '';
              return !title.includes('oppleve') && !title.includes('travel information');
            })
          : [];
        setQuestions(filtered.length > 0 ? filtered : DEFAULT_QUESTIONS);
        setTours(Array.isArray(tData?.tours) ? tData.tours : Array.isArray(tData) ? tData : []);
        setDestinations(Array.isArray(dData) ? dData : []);
        setActivities(Array.isArray(aData) ? aData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tourParam && tours.length > 0 && questions.length > 0) {
      const tour = tours.find(tr => tr.slug === tourParam);
      if (tour) {
        let destSlug = '';
        if (destParam && destinations.length > 0) {
          const dest = destinations.find(d => d.name === destParam || d.slug === destParam);
          destSlug = dest ? dest.slug : '';
        }
        setResponses(prev => ({
          ...prev,
          tour: tourParam,
          destination: destSlug || tour.destination
        }));
      }
    }
  }, [tourParam, destParam, tours, destinations, questions]);

  const totalSteps = questions.length + 1;
  const isLastStep = currentStepIdx === totalSteps - 1;
  const currentQuestion = questions[currentStepIdx];

  const handleOptionToggle = (questionId, value, isMulti) => {
    setError('');
    const currentValues = responses[questionId] || [];
    if (isMulti) {
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setResponses({ ...responses, [questionId]: newValues });
    } else {
      setResponses({ ...responses, [questionId]: [value] });
    }
  };

  const nextStep = () => {
    setError('');
    if (currentStepIdx < questions.length) {
      if (currentQuestion.question === 'Tour details' || currentQuestion.question === 'Turdetaljer') {
        if (!responses['accommodation']) {
          setError(t.planTrip.errorAccommodation);
          return;
        }

      } else {
        const isTravelDateStep = currentQuestion.question?.toLowerCase().includes('date') ||
          currentQuestion.question?.toLowerCase().includes('when') ||
          currentQuestion.question?.toLowerCase().includes('reisedato') ||
          currentQuestion.question?.toLowerCase().includes('reisedatoer');

        if (isTravelDateStep) {
          if (!responses['startDate']) {
            setError(t.planTrip.errorDepartureDate);
            return;
          }
        } else {
          const selection = responses[currentQuestion._id];
          if (!selection || selection.length === 0) {
            setError(t.planTrip.errorSelection);
            return;
          }
        }
      }
    } else {
      if (!contactInfo.name.trim() || !contactInfo.email.trim() || !contactInfo.password?.trim()) {
        setError(t.planTrip.errorNameEmail);
        return;
      }
    }

    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selections: responses,
          contact: contactInfo
        })
      });
      if (res.ok) {
        const data = await res.json();
        
        if (!session?.user && contactInfo.email && contactInfo.password) {
          try {
            await signIn('credentials', {
              redirect: false,
              email: contactInfo.email.trim(),
              password: contactInfo.password.trim(),
              name: contactInfo.name?.trim()
            });
          } catch (loginErr) {
            console.error("Auto login error:", loginErr);
          }
        }

        localStorage.removeItem('trip_responses');
        localStorage.removeItem('trip_contact');
        localStorage.removeItem('trip_step');

        router.push(`/plan-your-trip/chat/${data._id}`);
      } else {
        setLoading(false);
        setError('Kunne ikke sende forespørsel. Vennligst prøv igjen.');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Kunne ikke sende forespørsel. Vennligst prøv igjen.');
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="pt-60 pb-32 max-w-xl mx-auto px-6 text-center space-y-10">
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-12">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-orange-500 text-white p-2 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-primary uppercase tracking-tighter italic leading-none">{t.planTrip.received}</h1>
          <p className="text-gray-500 font-medium italic text-lg leading-relaxed max-w-md mx-auto">{t.planTrip.receivedDesc}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href={`/plan-your-trip/chat/${createdTripId}`} className="bg-primary text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-900 transition-all flex items-center justify-center space-x-3 hover:scale-105 active:scale-95">
            <MessageSquare className="w-4 h-4" />
            <span>{t.planTrip.goToChatPortal}</span>
          </Link>
          <Link href="/" className="border-2 border-gray-100 text-primary px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-primary transition-all flex items-center justify-center">{t.planTrip.home}</Link>
        </div>
      </div>
    </div>
  );

  const stepLabels = [t.planTrip.stepTravelers, t.planTrip.stepDates, t.planTrip.stepDetails, t.planTrip.stepContact];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/10">
      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-emerald-900 transition-all hover:scale-110 active:scale-90">
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 pt-44 pb-32">
        <header className="mb-20 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-3 bg-orange-50/50 border border-orange-100 text-orange-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 animate-pulse" />
            <span>{t.planTrip.badge}</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-primary uppercase tracking-tighter italic leading-[0.85]">{t.planTrip.title} <br /><span className="text-orange-500">{t.planTrip.titleHighlight}</span></h1>
          <p className="text-gray-400 font-medium text-sm lg:text-base max-w-2xl">{t.planTrip.subtitle}</p>
        </header>

        <div className="mb-24 px-4 sm:px-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-50 -translate-y-1/2 z-0 rounded-full" />
            <motion.div className="absolute top-1/2 left-0 h-[3px] bg-gradient-to-r from-primary to-orange-500 -translate-y-1/2 z-0 origin-left rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]" initial={{ scaleX: 0 }} animate={{ scaleX: currentStepIdx / (totalSteps - 1) }} transition={{ duration: 0.8, ease: "circOut" }} />
            {stepLabels.slice(0, totalSteps).map((label, i) => {
              const isActive = currentStepIdx === i;
              const isCompleted = currentStepIdx > i;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.3 : 1,
                      backgroundColor: isCompleted ? "var(--color-primary)" : "#ffffff",
                      borderColor: isCompleted || isActive ? "var(--color-primary)" : "#F3F4F6",
                      color: isCompleted ? "#ffffff" : isActive ? "var(--color-primary)" : "#D1D5DB",
                      boxShadow: isActive ? "0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 8px rgba(0,0,0,0.03)" : "none"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn("w-12 h-12 rounded-2xl border-4 flex items-center justify-center transition-all duration-300", isActive && "ring-8 ring-primary/5")}
                  >
                    {isCompleted ? <Check className="w-6 h-6 stroke-[4px]" /> : <span className="text-[13px] font-black">{i + 1}</span>}
                  </motion.div>
                  <div className="absolute top-16 flex flex-col items-center">
                    <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500", isActive ? "text-primary opacity-100 translate-y-0" : "text-gray-300 opacity-0 lg:opacity-100 translate-y-2")}>{label}</span>
                    {isActive && <motion.div layoutId="stepper-dot" className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 space-y-12 w-full">
            <AnimatePresence mode="wait">
              <motion.div key={currentStepIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="space-y-16">
                  {currentQuestion ? (
                    <div className="space-y-12">
                      <div className="space-y-4">
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">{t.planTrip.stepOf.replace('{current}', currentStepIdx + 1).replace('{total}', totalSteps)}</motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl lg:text-5xl font-black text-primary uppercase tracking-tighter leading-[0.95] italic">{currentQuestion.question}</motion.h2>
                      </div>

                      {currentQuestion.question?.toLowerCase().includes('date') || currentQuestion.question?.toLowerCase().includes('when') || currentQuestion.question?.toLowerCase().includes('reisedato') || currentQuestion.question?.toLowerCase().includes('reisedatoer') ? (
                        <div className="space-y-10">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <DateField
                              label={t.planTrip.departureDate}
                              value={responses['startDate']}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={v => { setError(''); setResponses(r => ({ ...r, startDate: v })); }}
                            />
                            <DateField
                              label={t.planTrip.returnDate}
                              value={responses['endDate']}
                              min={responses['startDate'] || new Date().toISOString().split('T')[0]}
                              onChange={v => { setError(''); setResponses(r => ({ ...r, endDate: v })); }}
                            />
                          </div>
                          <motion.label whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex items-center space-x-4 cursor-pointer group p-6 bg-emerald-50/50 rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all">
                            <div onClick={() => { setError(''); setResponses(r => ({ ...r, flexible_dates: !r.flexible_dates })); }} className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0", responses['flexible_dates'] ? "bg-primary border-primary" : "bg-white border-gray-200 group-hover:border-primary")}>
                              {responses['flexible_dates'] && <Check className="text-white w-4 h-4 stroke-[3px]" />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-primary uppercase tracking-tight">{t.planTrip.flexibleDates}</p>
                              <p className="text-[11px] text-gray-400 font-medium">{t.planTrip.flexibleDatesDesc}</p>
                            </div>
                          </motion.label>
                        </div>
                      ) : (currentQuestion.question === 'Tour details' || currentQuestion.question === 'Turdetaljer') ? (
                        <div className="space-y-12">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <label className="text-[11px] font-black uppercase tracking-widest">{t.planTrip.selectDestination}</label>
                              </div>
                              <div className="relative group">
                                <select value={responses['destination'] || ''} onChange={(e) => setResponses({ ...responses, destination: e.target.value, tour: "" })} className="w-full bg-white border-2 border-gray-100 rounded-[2rem] px-8 py-5 text-sm font-bold text-gray-900 focus:border-primary appearance-none pr-12 relative z-10 cursor-pointer shadow-sm transition-all">
                                  <option value="">{t.planTrip.selectDestinationPlaceholder}</option>
                                  {destinations.map(d => <option key={d._id} value={d.slug}>{tr(d, 'name', locale)}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-0 pointer-events-none group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 text-gray-400">
                                <Mountain className="w-4 h-4" />
                                <label className="text-[11px] font-black uppercase tracking-widest">{t.planTrip.selectTour}</label>
                              </div>
                              <div className="relative group">
                                <select value={responses['tour'] || ''} onChange={(e) => setResponses({ ...responses, tour: e.target.value })} className="w-full bg-white border-2 border-gray-100 rounded-[2rem] px-8 py-5 text-sm font-bold text-gray-900 focus:border-primary appearance-none pr-12 relative z-10 cursor-pointer shadow-sm transition-all">
                                  <option value="">{t.planTrip.noTour}</option>
                                  {tours
                                    .filter(tr => {
                                      if (!responses["destination"]) return true;
                                      const selectedDest = destinations.find(d => d.slug === responses["destination"]);
                                      const selectedName = selectedDest?.name;
                                      return tr.destination === responses["destination"] ||
                                        tr.destination === selectedName ||
                                        tr.destination?.toLowerCase() === responses["destination"]?.toLowerCase() ||
                                        tr.destination?.toLowerCase() === selectedName?.toLowerCase();
                                    })
                                    .map(tour => <option key={tour._id} value={tour.slug}>{tr(tour, 'title', locale)}</option>)
                                  }
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-0 pointer-events-none group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-gray-400">
                                <Heart className="w-4 h-4" />
                                <label className="text-[11px] font-black uppercase tracking-widest">{t.planTrip.whereStay}</label>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {(currentQuestion.options || []).map(opt => {
                                const isSelected = responses['accommodation'] === opt.value;
                                return (
                                  <motion.button key={opt.value} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => setResponses({ ...responses, accommodation: opt.value })} className={cn("p-6 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden", isSelected ? "border-primary bg-emerald-50/30 shadow-xl shadow-primary/5" : "border-gray-50 bg-white hover:border-gray-200")}>
                                    <div className="flex items-start justify-between mb-4">
                                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", isSelected ? "bg-primary text-white" : "bg-gray-50 text-gray-300")}>
                                        {(() => { const IconComp = IconMap[opt.icon || 'Layout'] || Layout; return <IconComp className="w-5 h-5" />; })()}
                                      </div>
                                      {isSelected && <div className="bg-primary text-white p-1 rounded-full"><Check className="w-3 h-3 stroke-[4px]" /></div>}
                                    </div>
                                    <p className="text-sm font-black text-primary uppercase tracking-tight mb-1">{opt.label}</p>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{opt.description}</p>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 text-gray-400">
                                <Sparkles className="w-4 h-4" />
                                <label className="text-[11px] font-black uppercase tracking-widest">{t.planTrip.budgetLabel}</label>
                              </div>
                              <div className="relative group flex items-center">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                  <select 
                                    value={responses['currency'] || 'NOK'} 
                                    onChange={e => setResponses({ ...responses, currency: e.target.value })}
                                    className="bg-gray-100 font-black text-xs text-gray-800 rounded-xl px-3 py-2 border-0 focus:ring-2 focus:ring-primary cursor-pointer uppercase tracking-wider hover:bg-gray-200 transition-colors"
                                  >
                                    <option value="NOK">NOK</option>
                                    <option value="DKK">DKK</option>
                                    <option value="SEK">SEK</option>
                                    <option value="EURO">EURO</option>
                                    <option value="USD">USD</option>
                                  </select>
                                </div>
                                <input type="number" placeholder="0" value={responses['budget'] || ''} onChange={e => setResponses({ ...responses, 'budget': e.target.value })} className="w-full bg-white border-2 border-gray-100 rounded-[2rem] pl-[7rem] pr-8 py-5 text-lg font-bold text-primary focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm placeholder:text-gray-200" />
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {[5000, 10000, 15000, 25000].map(amount => (
                                  <button key={amount} type="button" onClick={() => setResponses({ ...responses, 'budget': String(amount), 'budget_flexible': responses['budget_flexible'] || 'enough' })} className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all ${responses['budget'] === String(amount) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30 hover:text-primary'}`}>{amount.toLocaleString('no-NO')} {responses['currency'] || 'NOK'}</button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 text-gray-400">
                                <Zap className="w-4 h-4" />
                                <label className="text-[11px] font-black uppercase tracking-widest">{t.planTrip.budgetFlexible}</label>
                              </div>
                              <div className="relative group">
                                <select value={responses['budget_flexible'] || ''} onChange={e => setResponses({ ...responses, 'budget_flexible': e.target.value })} className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl px-8 py-5 text-sm font-bold text-gray-900 focus:border-primary appearance-none pr-12 cursor-pointer shadow-sm transition-all">
                                  <option value="">{t.planTrip.select}</option>
                                  <option value="yes">{t.planTrip.budgetYes}</option>
                                  <option value="no">{t.planTrip.budgetNo}</option>
                                  <option value="enough">{t.planTrip.budgetEstimate}</option>
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4 pt-4">
                            <div className="flex items-center space-x-2 text-gray-400">
                              <Edit2 className="w-4 h-4" />
                              <label className="text-[11px] font-black uppercase tracking-widest">{t.planTrip.tellMore}</label>
                            </div>
                            <textarea rows={5} value={responses['trip_description'] || ''} onChange={e => setResponses({ ...responses, 'trip_description': e.target.value })} className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-[2.5rem] px-8 py-6 text-sm font-medium text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm resize-none" placeholder={t.planTrip.tellMorePlaceholder} />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentQuestion.type === 'text' ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-2">
                              <textarea rows={6} value={responses[currentQuestion._id]?.[0] || ''} onChange={e => setResponses({ ...responses, [currentQuestion._id]: [e.target.value] })} className="w-full bg-white border-2 border-gray-100 rounded-3xl px-6 py-5 text-sm font-light text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm resize-none" placeholder={t.planTrip.textPlaceholder} />
                            </motion.div>
                          ) : (
                            currentQuestion.options.map((opt, i) => {
                              const Icon = IconMap[opt.icon] || Layout;
                              const isSelected = (responses[currentQuestion._id] || []).includes(opt.value);
                              return (
                                <motion.button key={opt.value} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => handleOptionToggle(currentQuestion._id, opt.value, currentQuestion.type === 'multi-select')} className={cn("p-6 rounded-3xl border-2 transition-all flex flex-col items-start space-y-6 text-left relative group overflow-hidden", isSelected ? "border-primary bg-emerald-50/20 shadow-md" : "border-gray-50 bg-white hover:border-primary/20")}>
                                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 relative z-10", isSelected ? "bg-primary text-white rotate-12 scale-110 shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white")}>
                                    <Icon className="w-6 h-6" />
                                  </div>
                                  <div className="space-y-1 relative z-10">
                                    <p className={cn("text-base font-bold font-display tracking-tight transition-colors", isSelected ? "text-primary" : "text-gray-700 group-hover:text-primary")}>{opt.label}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isSelected ? t.planTrip.selected : t.planTrip.clickToSelect}</p>
                                  </div>
                                  {isSelected && (
                                    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="absolute top-6 right-6 bg-primary text-white p-1.5 rounded-xl shadow-sm">
                                      <Check className="w-4 h-4 stroke-[4px]" />
                                    </motion.div>
                                  )}
                                </motion.button>
                              );
                            })
                          )}
                        </div>
                      )}
                      {(() => {
                        const selected = responses[currentQuestion._id] || [];
                        const showCounter = selected.some(v => v?.toLowerCase().includes('famil') || v?.toLowerCase().includes('group') || v?.toLowerCase().includes('gruppe'));
                        if (!showCounter) return null;
                        return (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-3xl border-2 border-primary/5 bg-emerald-50/30 space-y-6 shadow-inner">
                            <div className="flex items-center space-x-2.5">
                              <Users className="w-4 h-4 text-primary" />
                              <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">{t.planTrip.specifyGroup}</h3>
                            </div>
                            <div className="space-y-6">
                              <div className="flex items-center justify-between group">
                                <div className="space-y-0.5">
                                  <p className="text-base font-bold text-primary tracking-tight">{t.planTrip.adults}</p>
                                  <p className="text-[11px] text-gray-400 font-light">{t.planTrip.adultsDesc}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <button type="button" onClick={() => { const n = Math.max(1, adults - 1); setAdults(n); setResponses(r => ({ ...r, adults: n, children })); }} className="w-10 h-10 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all font-bold text-lg active:scale-90">−</button>
                                  <span className="w-8 text-center text-xl font-bold text-primary tabular-nums tracking-tight">{adults}</span>
                                  <button type="button" onClick={() => { const n = adults + 1; setAdults(n); setResponses(r => ({ ...r, adults: n, children })); }} className="w-10 h-10 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all font-bold text-lg active:scale-90">+</button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-6 border-t border-primary/10 group">
                                <div className="space-y-0.5">
                                  <p className="text-base font-bold text-primary tracking-tight">{t.planTrip.children}</p>
                                  <p className="text-[11px] text-gray-400 font-light">{t.planTrip.childrenDesc}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <button type="button" onClick={() => { const n = Math.max(0, children - 1); setChildren(n); setResponses(r => ({ ...r, adults, children: n })); }} className="w-10 h-10 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all font-bold text-lg active:scale-90">−</button>
                                  <span className="w-8 text-center text-xl font-bold text-primary tabular-nums tracking-tight">{children}</span>
                                  <button type="button" onClick={() => { const n = children + 1; setChildren(n); setResponses(r => ({ ...r, adults, children: n })); }} className="w-10 h-10 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all font-bold text-lg active:scale-90">+</button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold uppercase tracking-wider text-orange-500">{t.planTrip.lastStep}</motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight leading-tight">{t.planTrip.contactTitle}</motion.h2>
                        <p className="text-gray-400 font-light text-sm">{t.planTrip.contactSubtitle}</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className={cn("space-y-8 order-2 lg:order-1", session?.user ? "col-span-2" : "col-span-1")}>
                          <div className={cn("space-y-6", session?.user ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 space-y-0" : "space-y-6")}>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t.planTrip.fullName}</label>
                              <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                                <input type="text" required placeholder={t.planTrip.namePlaceholder} value={contactInfo.name} onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })} className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl px-14 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t.planTrip.emailLabel}</label>
                              <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                                <input type="email" required placeholder={t.planTrip.emailPlaceholder} value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl px-14 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t.planTrip.passwordLabel}</label>
                              <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                                <input type="password" required placeholder={t.planTrip.passwordPlaceholder} value={contactInfo.password || ''} onChange={e => setContactInfo({ ...contactInfo, password: e.target.value })} className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl px-14 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {!session?.user && (
                          <div className="space-y-8 order-1 lg:order-2">
                            <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border-2 border-gray-100/50 space-y-8">
                              <div className="space-y-2 text-center">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-primary">
                                  <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-black text-primary uppercase tracking-tight italic">{t.planTrip.quickLogin}</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{t.planTrip.syncPlans}</p>
                              </div>
                              <div className="space-y-4">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => signIn('google')} className="w-full bg-white border-2 border-gray-100 text-gray-700 px-6 py-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-3 shadow-sm hover:border-primary/20 transition-all">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.23l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                  </svg>
                                  <span>{t.planTrip.loginGoogle}</span>
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-gray-100 mt-16">
              <div className="flex items-center space-x-6 order-2 sm:order-1">
                {currentStepIdx > 0 && (
                  <motion.button whileHover={{ x: -4 }} onClick={() => setCurrentStepIdx(prev => prev - 1)} className="px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all flex items-center space-x-2">
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.planTrip.back}</span>
                  </motion.button>
                )}
              </div>
              <div className="flex flex-col items-end space-y-4 w-full sm:w-auto order-1 sm:order-2">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-red-50 border border-red-100 px-6 py-3 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm">
                      <Info className="w-3.5 h-3.5 mr-2" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={nextStep} className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-900 transition-all flex items-center justify-center space-x-4 group ring-8 ring-primary/5">
                  <span>{isLastStep ? t.planTrip.createPlan : t.planTrip.nextStep}</span>
                  {isLastStep ? <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </div>
            </div>
          </div>
          <aside className="lg:w-96 w-full shrink-0">
            <div className={cn("bg-primary rounded-[3rem] p-10 transition-all duration-500", "lg:sticky lg:top-32", "mt-12 lg:mt-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] text-white overflow-hidden relative")}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/20 rounded-full -ml-12 -mb-12 blur-xl" />
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{t.planTrip.tripPlan}</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{t.planTrip.yourNepalExperience}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
                <div className="space-y-8">
                  {questions.map((q) => {
                    const selection = responses[q._id];
                    if (!selection || (Array.isArray(selection) && selection.length === 0)) return null;
                    return (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={q._id} className="space-y-3 group">
                        <div className="flex items-center space-x-3 text-white/40 group-hover:text-orange-400 transition-colors">
                          <div className="w-1 h-1 rounded-full bg-current" />
                          <p className="text-[9px] font-black uppercase tracking-[0.25em]">{q.question}</p>
                        </div>
                        <div className="pl-4">
                          {Array.isArray(selection) ? (
                            <div className="flex flex-wrap gap-2">
                              {selection.map(s => <span key={s} className="text-[10px] font-black text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md">{s}</span>)}
                            </div>
                          ) : (
                            <p className="text-base font-black text-white italic leading-tight tracking-tight">{selection}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {(!responses[questions.find(q => q.question === 'Tour details' || q.question === 'Turdetaljer')?._id]) && (responses['tour'] || responses['destination']) && (
                    <div className="space-y-6 pt-6 border-t border-white/10">
                      {responses['destination'] && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 text-white/40">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <p className="text-[9px] font-black uppercase tracking-[0.25em]">{t.planTrip.asideDestination}</p>
                          </div>
                          <p className="pl-4 text-base font-black text-white italic tracking-tight">{responses['destination']}</p>
                        </div>
                      )}
                      {responses['tour'] && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 text-white/40">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <p className="text-[9px] font-black uppercase tracking-[0.25em]">{t.planTrip.selectedTour}</p>
                          </div>
                          <p className="pl-4 text-base font-black text-white italic tracking-tight">{responses['tour']}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {(responses['adults'] || responses['startDate']) && (
                    <div className="pt-8 border-t border-white/10 space-y-6">
                      {responses['adults'] && (
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center space-x-3">
                            <Users className="w-4 h-4 text-orange-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{t.planTrip.travelers}</p>
                          </div>
                          <p className="text-xs font-black text-white tracking-tighter">{t.planTrip.travelersValue.replace('{adults}', responses['adults']).replace('{children}', responses['children'] || 0)}</p>
                        </div>
                      )}
                      {responses['startDate'] && (
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{t.planTrip.period}</p>
                          </div>
                          <p className="text-xs font-black text-white uppercase tracking-tighter">
                            {new Date(responses['startDate']).toLocaleDateString('no-NO', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="pt-10 border-t border-white/10 flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    <Shield className="w-3 h-3" />
                    <span>{t.planTrip.safePlanning}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function PlanYourTripPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PlanYourTripContent />
    </Suspense>
  );
}
