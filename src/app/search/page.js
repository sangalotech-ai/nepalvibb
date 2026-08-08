"use client";

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Filter, MapPin, 
  Clock, Star, ArrowRight,
  Compass, Calendar, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

function SearchContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const destination = searchParams.get('destination');
  const activity = searchParams.get('activity');
  const duration = searchParams.get('duration');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?${searchParams.toString()}`);
        const data = await res.json();
        setTours(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <main className="flex-1 pt-36 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3">
              <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-1">{t.searchPage.titleLabel}</h5>
              <h1 className="text-4xl md:text-6xl font-bold font-display text-primary tracking-tight leading-tight">
                {t.searchPage.subtitle} <span className="text-orange-500">{t.searchPage.subtitleHighlight}</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {destination && (
                <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-full flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>{destination}</span>
                </div>
              )}
              {activity && (
                <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-full flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
                  <Compass className="w-3.5 h-3.5 text-blue-500" />
                  <span>{activity}</span>
                </div>
              )}
              {duration && (
                <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-full flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{duration} {t.searchPage.daysLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-primary/10 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 animate-pulse">{t.searchPage.loadingText}</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 md:p-20 text-center border border-gray-100 space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight">{t.searchPage.noResultsTitle}</h3>
                <p className="text-gray-500 font-light leading-relaxed text-sm">{t.searchPage.noResultsDesc}</p>
              </div>
              <Link href="/" className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-orange-500 transition-all shadow-md">
                {t.searchPage.backHome}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <div key={tour._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 group border border-gray-100 flex flex-col">
                  <div className="relative h-72 overflow-hidden">
                    <img src={tour.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={tr(tour, 'title', locale)} loading="lazy" />
                    <div className="absolute top-6 left-6 bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold uppercase px-4 py-1.5 rounded-full tracking-wider">
                      {tr(tour, 'difficulty', locale)}
                    </div>
                    <div className="absolute bottom-6 right-6 bg-orange-500 text-white font-bold px-4 py-3 rounded-2xl shadow-lg">
                      <p className="text-[9px] font-medium text-orange-200 uppercase tracking-wider mb-0.5">{t.common.fra}</p>
                      <p className="text-base leading-none">NOK {tour.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold font-display text-primary mb-3 tracking-tight line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                      {tr(tour, 'title', locale)}
                    </h3>
                    <div
                      className="text-gray-500 font-light mb-8 line-clamp-2 leading-relaxed text-sm [&_p]:m-0 [&_p]:inline"
                      dangerouslySetInnerHTML={{ __html: tr(tour, 'summary', locale) }}
                    />
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>{tr(tour, 'duration', locale)}</span>
                        </div>
                      </div>
                      <Link href={`/trips/${tour.slug}`} className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center group-hover:text-orange-500 transition-all">
                        <span>{t.searchPage.viewTrip}</span> 
                        <ArrowRight className="w-4 h-4 ml-2 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
 
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
