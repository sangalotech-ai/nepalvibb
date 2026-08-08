"use client";

import { useState, useEffect } from 'react';
import { Star, Send, User, Calendar, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

export default function ReviewSection({ tripId }) {
  const { t, locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    rating: 5,
    comment: ''
  });

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?tripId=${tripId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tripId })
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ userName: '', userEmail: '', rating: 5, comment: '' });
        setTimeout(() => {
          setSubmitted(false);
          setShowForm(false);
        }, 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="omtaler" className="scroll-mt-40 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-8 gap-6">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight">{t.reviews.title}</h2>
          <div className="flex items-center space-x-4">
            <div className="flex text-orange-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-light text-gray-500 tracking-wide">{reviews.length} {t.reviews.count}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-500 transition-all self-start sm:self-auto"
        >
          {showForm ? t.reviews.cancel : t.reviews.write}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50/50 p-8 md:p-12 rounded-3xl border border-gray-100/55 space-y-8">
              {submitted ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-primary tracking-tight">{t.reviews.thank}</h3>
                  <p className="text-gray-500 font-light text-sm">{t.reviews.thankDesc}</p>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold font-display text-primary tracking-tight">{t.reviews.share}</h3>
                    <p className="text-gray-500 text-sm font-light">{t.reviews.shareDesc}</p>
                  </div>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2">{t.reviews.name}</label>
                      <input 
                        type="text" 
                        required
                        value={formData.userName}
                        onChange={(e) => setFormData({...formData, userName: e.target.value})}
                        className="w-full bg-white border-2 border-gray-50 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-primary shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2">{t.reviews.email}</label>
                      <input 
                        type="email" 
                        required
                        value={formData.userEmail}
                        onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                        className="w-full bg-white border-2 border-gray-50 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-primary shadow-sm" 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2 text-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t.reviews.rating}</label>
                      <div className="flex justify-center space-x-3 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            type="button"
                            onClick={() => setFormData({...formData, rating: star})}
                            className="transition-transform active:scale-90"
                          >
                            <Star className={cn("w-7 h-7", formData.rating >= star ? "text-orange-500 fill-current" : "text-gray-200")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2">{t.reviews.feedback}</label>
                      <textarea 
                        rows={5} 
                        required
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        className="w-full bg-white border-2 border-gray-50 rounded-2xl px-6 py-5 text-sm font-light focus:outline-none focus:border-primary shadow-sm resize-none" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button 
                        disabled={submitting}
                        className="w-full bg-primary text-white py-4.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-orange-500 transition-all flex items-center justify-center space-x-3"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{t.reviews.send}</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-50/50 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto text-gray-300 shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-lg font-bold font-display text-primary tracking-tight">{t.reviews.none}</p>
            <p className="text-gray-500 text-sm font-light">{t.reviews.noneDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {reviews.map((review) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={review._id} 
                className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {review.userName[0]}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-base font-bold text-primary tracking-tight">{review.userName}</h4>
                      <div className="flex items-center space-x-2 text-[10px] font-light text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>{new Date(review.createdAt).toLocaleDateString('no-NO')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex text-orange-500 bg-orange-50/70 px-4 py-1.5 rounded-full self-start sm:self-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn("w-3.5 h-3.5", review.rating >= star ? "fill-current" : "opacity-20")} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 font-light leading-relaxed text-base border-l-4 border-orange-500 pl-6 ml-1">
                  &ldquo;{tr(review, 'comment', locale)}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
