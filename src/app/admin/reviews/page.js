"use client";

import { useState, useEffect } from 'react';
import { 
  Star, CheckCircle, XCircle, Trash2, 
  MessageSquare, User, Clock, MapPin, 
  Search, Filter, ExternalLink, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setReviews(reviews.map(r => r._id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Er du sikker på at du vil slette denne omtalen?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.tripId?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Administrer Omtaler</h1>
          <p className="text-gray-400 font-medium italic">Moderer og administrer tilbakemeldinger fra reisende.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Totalt', value: stats.total, color: 'text-primary', bg: 'bg-gray-50', icon: MessageSquare },
          { label: 'Venter på godkjenning', value: stats.pending, color: 'text-orange-500', bg: 'bg-orange-50', icon: Clock },
          { label: 'Godkjente', value: stats.approved, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle },
        ].map((s, i) => (
          <div key={i} className={cn("p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between shadow-sm", s.bg)}>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
              <p className={cn("text-4xl font-black italic", s.color)}>{s.value}</p>
            </div>
            <div className={cn("w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm", s.color)}>
              <s.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Søk i omtaler, brukere eller reiser..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl pl-14 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex bg-gray-50 p-1 rounded-xl">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-32 text-center border border-gray-100 space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <AlertCircle className="w-10 h-10" />
            </div>
            <p className="text-xl font-black text-primary uppercase italic">Ingen omtaler funnet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReviews.map((review) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={review._id} 
                className={cn(
                  "bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all group",
                  review.status === 'pending' && "border-orange-200 bg-orange-50/10"
                )}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg">
                          {review.userName[0]}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-primary uppercase italic tracking-tighter">{review.userName}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{review.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex text-orange-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={cn("w-4 h-4", review.rating >= star ? "fill-current" : "opacity-10")} />
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 italic font-medium text-gray-600 leading-relaxed">
                      "{review.comment}"
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center text-primary">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-orange-500" />
                        <span>Reise: {review.tripId?.title || 'Ukjent'}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-3.5 h-3.5 mr-2" />
                        <span>Innsendt: {new Date(review.createdAt).toLocaleString('no-NO')}</span>
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full border flex items-center space-x-2",
                        review.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        review.status === 'pending' ? "bg-orange-50 text-orange-600 border-orange-100 animate-pulse" :
                        "bg-red-50 text-red-600 border-red-100"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                          review.status === 'approved' ? "bg-emerald-500" :
                          review.status === 'pending' ? "bg-orange-500" :
                          "bg-red-500"
                        )} />
                        <span>{review.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-64 flex flex-col justify-center space-y-3">
                    {review.status !== 'approved' && (
                      <button 
                        onClick={() => handleUpdateStatus(review._id, 'approved')}
                        className="w-full bg-emerald-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center space-x-3 shadow-lg shadow-emerald-500/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Godkjenn</span>
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button 
                        onClick={() => handleUpdateStatus(review._id, 'rejected')}
                        className="w-full bg-orange-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center space-x-3 shadow-lg shadow-orange-500/10"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Avvis</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(review._id)}
                      className="w-full bg-red-50 text-red-500 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Slett</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
