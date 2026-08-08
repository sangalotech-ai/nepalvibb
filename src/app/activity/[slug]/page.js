"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Clock, MapPin, Star, Compass,
  ArrowRight, Mountain, Wind, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

export default function ActivityDetailPage({ params }) {
  const { t, locale } = useLocale();
  const { slug } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/activities/${slug}`);
        if (!res.ok) throw new Error('Activity not found');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <h1 className="text-3xl font-bold font-display text-primary tracking-tight mb-4">{t.activityDetail.notFoundTitle}</h1>
      <Link href="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider">{t.activityDetail.backHome}</Link>
    </div>
  );

  const { activity, trips = [] } = data;

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden flex items-center pt-20">
        <img
          src={activity.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80'}
          className="absolute inset-0 w-full h-full object-cover"
          alt={tr(activity, 'name', locale)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 w-full pt-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className=""
          >
            <h5 className="text-orange-500 font-bold uppercase tracking-wider text-[10px]">{t.activityDetail.heroSubtitle}</h5>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display text-white tracking-tight leading-tight">
              {tr(activity, 'name', locale)}
            </h1>
            <div
              className="text-lg sm:text-xl text-white/90 font-light leading-relaxed border-l-4 border-orange-500 pl-6 [&_p]:m-0"
              dangerouslySetInnerHTML={{ __html: tr(activity, 'description', locale) || `${t.activityDetail.descriptionFallbackPrefix} ${tr(activity, 'name', locale).toLowerCase()} ${t.activityDetail.descriptionFallbackSuffix}` }}
            />
          </motion.div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight">{t.activityDetail.recommendedTitle}</h2>
              <p className="text-sm text-gray-500 font-light uppercase tracking-wider">{t.activityDetail.recommendedSubtitlePrefix} {tr(activity, 'name', locale)} {t.activityDetail.recommendedSubtitleSuffix}</p>
            </div>
            <div className="flex items-center space-x-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{trips.length} {t.activityDetail.tripsFound}</span>
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.length > 0 ? trips.map((trip) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={trip._id}
                className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100/50 group transition-all hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={trip.image}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt={tr(trip, 'title', locale)}
                  />
                  <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold uppercase px-4 py-1.5 rounded-full tracking-wider">
                    {tr(trip, 'difficulty', locale) || t.activityDetail.difficultyFallback}
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">{tr(trip, 'duration', locale)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{tr(trip, 'destination', locale)}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-primary tracking-tight group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
                    {tr(trip, 'title', locale)}
                  </h3>
                  <div
                    className="text-sm font-light text-gray-500 line-clamp-2 leading-relaxed [&_p]:m-0 [&_p]:inline"
                    dangerouslySetInnerHTML={{ __html: tr(trip, 'summary', locale) }}
                  />
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-primary">
                      <span className="text-[9px] block font-bold uppercase tracking-wider text-gray-400 mb-1">{t.activityDetail.priceFrom}</span>
                      <span className="text-xl font-bold font-display text-primary">NOK {trip.price?.toLocaleString()}</span>
                    </div>
                    <Link href={`/trips/${trip.slug}`} className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-gray-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold font-display text-primary tracking-tight">{t.activityDetail.noTripsTitle}</p>
                  <p className="text-gray-500 font-light text-sm">{t.activityDetail.noTripsDesc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
