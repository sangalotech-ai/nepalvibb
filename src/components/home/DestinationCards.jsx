"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';

export default function DestinationCards({ content }) {
  const { t } = useLocale();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch('/api/destinations');
        const data = await res.json();
        setDestinations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  if (loading) return null; 

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h5 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-3"
            >
              {content?.subtitle || t.destinations.subtitle}
            </motion.h5>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight"
            >
              {content?.title || t.destinations.title}
            </motion.h2>
          </div>
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="shrink-0"
          >
            <Link href="/destination/nepal" className="text-xs font-bold uppercase tracking-wider text-primary border-b-2 border-orange-500 pb-1.5 hover:text-orange-500 transition-colors">
              {t.destinations.seAlle}
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={`/destination/${destination.slug}`}
                className="group relative rounded-3xl overflow-hidden h-[400px] sm:h-[480px] block transition-all duration-700 hover:shadow-lg"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${destination.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent opacity-70 group-hover:opacity-80 transition-all duration-700" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 sm:p-8 text-center">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    <span className="text-orange-400 font-bold uppercase text-[10px] tracking-wider mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      {t.destinations.travel}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight mb-4">
                      {destination.name}
                    </h3>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-6 group-hover:translate-y-0 shadow-lg">
                    <ArrowUpRight className="text-white w-5 h-5" />
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
