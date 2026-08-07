"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';

export default function FeaturedActivities({ content }) {
  const { t } = useLocale();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (Array.isArray(data)) {
          let featured = data.filter(a => a.isFeatured);
          if (featured.length < 5) {
            const nonFeatured = data.filter(a => !a.isFeatured);
            featured = [...featured, ...nonFeatured];
          }
          setActivities(featured.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [activities]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      if (!canScrollRight && scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [canScrollRight, activities]);

  if (loading || activities.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs">
              {content?.subtitle || t.activities.subtitle}
            </h5>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight">
              {content?.title || t.activities.title}
            </h2>
          </div>
          
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                  canScrollLeft 
                    ? 'bg-white text-primary hover:border-orange-500 hover:text-orange-500 cursor-pointer shadow-sm' 
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                  canScrollRight 
                    ? 'bg-white text-primary hover:border-orange-500 hover:text-orange-500 cursor-pointer shadow-sm' 
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Link href="/activity/all" className="bg-primary hover:bg-emerald-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md shrink-0">
              {t.common.seAlle}
            </Link>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 snap-x snap-mandatory scroll-smooth pb-6 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {activities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="w-[280px] sm:w-[340px] md:w-[380px] shrink-0 snap-start group relative"
            >
              <Link href={`/activity/${activity.slug}`}>
                <div className="h-[380px] sm:h-[460px] rounded-3xl overflow-hidden relative border border-gray-100 group-hover:border-orange-500/20 transition-all hover:shadow-lg">
                  <img 
                    src={activity.image} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    alt={activity.name} 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent" />
                  
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-orange-500 transition-all">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mb-2 leading-tight">
                      {activity.name}
                    </h3>
                    <div
                      className="hidden sm:block text-sm text-white/70 font-light line-clamp-2 mb-6 group-hover:text-white transition-colors [&_p]:m-0 [&_p]:inline"
                      dangerouslySetInnerHTML={{ __html: activity.description }}
                    />
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                      <span>{t.activities.explore}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
