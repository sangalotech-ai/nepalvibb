"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Map, Compass, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/providers/useLocale';

export default function SearchSection() {
  const router = useRouter();
  const { t } = useLocale();
  const [filters, setFilters] = useState({
    destination: t.search.selectDestination,
    activity: t.search.selectActivity,
    duration: t.search.durationLabel
  });
  const [options, setOptions] = useState({
    destinations: [],
    activities: [],
    durations: []
  });

  useEffect(() => {
    fetch('/api/search/options')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setOptions(data);
        }
      })
      .catch(err => console.error('Error fetching search options:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.destination !== t.search.selectDestination) params.append('destination', filters.destination);
    if (filters.activity !== t.search.selectActivity) params.append('activity', filters.activity);
    if (filters.duration !== t.search.durationLabel) params.append('duration', filters.duration);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative z-30 -mt-20 max-w-7xl mx-auto px-6"
    >
      <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.12)] p-10 md:p-14 border border-gray-50 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-end relative z-10">
          
          {/* Destination */}
          <div className="space-y-4">
            <div className="flex items-center text-primary/40 space-x-2">
              <Map className="w-4 h-4" />
              <label className="text-[10px] font-black uppercase tracking-[0.3em]">{t.search.destination}</label>
            </div>
            <div className="relative group/select">
              <select 
                value={filters.destination}
                onChange={(e) => setFilters({...filters, destination: e.target.value})}
                className="w-full bg-gray-50/50 border-b-2 border-gray-100 focus:border-orange-500 rounded-none px-2 py-4 text-[13px] font-black uppercase tracking-widest text-primary appearance-none focus:outline-none transition-all cursor-pointer"
              >
                <option>{t.search.selectDestination}</option>
                {options.destinations.map(d => <option key={d}>{d}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover/select:text-orange-500 transition-colors" />
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <div className="flex items-center text-primary/40 space-x-2">
              <Compass className="w-4 h-4" />
              <label className="text-[10px] font-black uppercase tracking-[0.3em]">{t.search.activity}</label>
            </div>
            <div className="relative group/select">
              <select 
                value={filters.activity}
                onChange={(e) => setFilters({...filters, activity: e.target.value})}
                className="w-full bg-gray-50/50 border-b-2 border-gray-100 focus:border-orange-500 rounded-none px-2 py-4 text-[13px] font-black uppercase tracking-widest text-primary appearance-none focus:outline-none transition-all cursor-pointer"
              >
                <option>{t.search.selectActivity}</option>
                {options.activities.map(a => <option key={a}>{a}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover/select:text-orange-500 transition-colors" />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-4">
            <div className="flex items-center text-primary/40 space-x-2">
              <Calendar className="w-4 h-4" />
              <label className="text-[10px] font-black uppercase tracking-[0.3em]">{t.search.duration}</label>
            </div>
            <div className="relative group/select">
              <select 
                value={filters.duration}
                onChange={(e) => setFilters({...filters, duration: e.target.value})}
                className="w-full bg-gray-50/50 border-b-2 border-gray-100 focus:border-orange-500 rounded-none px-2 py-4 text-[13px] font-black uppercase tracking-widest text-primary appearance-none focus:outline-none transition-all cursor-pointer"
              >
                <option>{t.search.durationLabel}</option>
                {options.durations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover/select:text-orange-500 transition-colors" />
            </div>
          </div>

          {/* Seek Button */}
          <button type="submit" className="w-full bg-primary hover:bg-emerald-900 text-white font-black uppercase tracking-[0.4em] text-[11px] py-6 rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center group shadow-emerald-900/20">
            <Search className="w-4 h-4 mr-4 group-hover:scale-125 transition-transform" />
            {t.search.searchNow}
          </button>

        </form>
      </div>
    </motion.div>
  );
}
