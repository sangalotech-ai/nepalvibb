"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Compass } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

export default function TurerPage() {
  const { locale } = useLocale();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const fetchTours = async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips?page=${p}&limit=${limit}`);
      const data = await res.json();
      setTours(data.tours || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-24">
        <div className="text-center mb-14">
          <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-3">
            Utforsk Nepal
          </h5>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-primary tracking-tight leading-tight">
            Våre turer & trekk
          </h1>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 animate-pulse">Laster turer...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 md:p-20 text-center border border-gray-100 space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8 text-gray-200" />
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight">Ingen turer funnet</h3>
              <p className="text-gray-500 font-light leading-relaxed text-sm">Det er ingen turer tilgjengelig for øyeblikket.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tours.map((tour) => (
                <div
                  key={tour._id}
                  className="bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 group border border-gray-100 flex flex-col hover:shadow-lg"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={tour.image}
                      alt={tr(tour, 'title', locale)}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 bg-primary/95 text-white text-[9px] font-bold uppercase px-3 py-1.5 rounded-full tracking-wider shadow-md backdrop-blur-sm">
                      {(locale === 'en'
                        ? (Array.isArray(tour.categoryEn) ? tour.categoryEn[0] : (tour.categoryEn || tour.category))
                        : (Array.isArray(tour.category) ? tour.category[0] : tour.category)) || 'Eventyr'}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-orange-500 text-white font-bold px-4 py-2 rounded-2xl shadow-md">
                      <p className="text-[9px] block font-light text-orange-200 uppercase tracking-wider leading-none mb-0.5">Fra</p>
                      <p className="text-sm">NOK {tour.price?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold font-display text-primary mb-2 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                      {tr(tour, 'title', locale)}
                    </h3>
                    <div
                      className="text-gray-500 font-light text-xs mb-4 line-clamp-2 leading-relaxed [&_p]:m-0 [&_p]:inline"
                      dangerouslySetInnerHTML={{ __html: tr(tour, 'summary', locale) }}
                    />
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>{tr(tour, 'duration', locale)}</span>
                      </div>
                      <Link href={`/trips/${tour.slug}`} className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center group-hover:text-orange-500 transition-all">
                        <span>Les mer</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
