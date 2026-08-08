"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/providers/useLocale';
import { tr, trItem } from '@/lib/tr';

export default function Testimonials({ content }) {
  const { t, locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/admin/reviews'); // Fetching all but we will filter for approved
        const data = await res.json();
        setReviews(data.filter(r => r.status === 'approved').slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-gray-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-3">
          <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs">
            {tr(content, 'subtitle', locale) || t.testimonials.subtitle}
          </h5>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight">
            {tr(content, 'title', locale) || t.testimonials.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div 
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group relative flex flex-col justify-between"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-primary/5 group-hover:text-orange-500/10 transition-colors" />
              
              <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex text-orange-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn("w-4 h-4", review.rating >= star ? "fill-current" : "opacity-10")} />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 font-light leading-relaxed text-base">
                    &ldquo;{tr(review, 'comment', locale).length > 120 ? tr(review, 'comment', locale).substring(0, 120) + '...' : tr(review, 'comment', locale)}&rdquo;
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-6 border-t border-gray-50 mt-6">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                    {review.userName[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary tracking-tight">{review.userName}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">{trItem(review.tripId, 'title', locale) || t.testimonials.guest}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
