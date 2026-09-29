"use client";

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Calendar, User, Mail, 
  Phone, Trash2, ChevronRight, Filter,
  Search, Clock, MapPin, Tag, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function RequestsAdminPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests', { cache: 'no-store' });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      const res = await fetch(`/api/admin/requests?id=${id}`, { method: 'DELETE' });
      if (res.ok) setRequests(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-primary uppercase tracking-tight">Traveler Chats</h1>
        <p className="text-sm text-gray-400 font-medium">Manage and respond to traveler inquiries in real-time.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Filter by:</span>
            <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-lg text-primary">All Requests</button>
            <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 text-gray-400 hover:text-primary transition-colors">Pending</button>
            <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 text-gray-400 hover:text-primary transition-colors">Booked</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." className="bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2 text-xs w-64 focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fetching Inquiries...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-medium italic">No requests found.</div>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="p-8 hover:bg-gray-50/50 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* User Info */}
                  <div className="flex items-start space-x-5 flex-1">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center font-black text-primary text-xl uppercase">
                      {req.name ? req.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-black text-primary uppercase tracking-tight">{req.name || 'Anonymous Traveler'}</h3>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${req.status === 'active' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-bold text-gray-400">
                        <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5" /> {req.email}</span>
                        {req.phone && <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5" /> {req.phone}</span>}
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-[1.5]">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Destination</p>
                      <p className="text-xs font-bold text-gray-600 flex items-center"><MapPin className="w-3 h-3 mr-1 text-orange-500" /> {req.destination || 'Nepal'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">When</p>
                      <p className="text-xs font-bold text-gray-600 flex items-center"><Calendar className="w-3 h-3 mr-1 text-blue-500" /> {req.month || 'Flexible'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Group</p>
                      <p className="text-xs font-bold text-gray-600 flex items-center"><User className="w-3 h-3 mr-1 text-purple-500" /> {req.group || 'Individual'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Budget</p>
                      <p className="text-xs font-bold text-gray-600 flex items-center"><Tag className="w-3 h-3 mr-1 text-emerald-500" /> {req.budget || 'Mid-range'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Link 
                      href={`/admin/requests/${req._id}`}
                      className="relative bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-lg shadow-primary/10 flex items-center space-x-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Respond</span>
                      {req.messages?.filter(m => m.sender === 'user' && !m.read).length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] animate-bounce">
                          {req.messages.filter(m => m.sender === 'user' && !m.read).length}
                        </span>
                      )}
                    </Link>
                    <button 
                      onClick={() => handleDelete(req._id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {req.notes && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Traveler Notes</p>
                    <p className="text-xs text-orange-950 font-medium leading-relaxed italic">"{req.notes}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
