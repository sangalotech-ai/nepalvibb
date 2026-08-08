"use client";

import { useState, useEffect } from 'react';
import { 
  Map, Plus, Trash2, Edit2, 
  Search, ExternalLink, Image as ImageIcon,
  MapPin, Compass
} from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

export default function DestinationsAdminPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', image: '', description: '', nameEn: '', descriptionEn: '' });

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await fetch('/api/admin/destinations');
      const data = await res.json();
      setDestinations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/admin/destinations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchDestinations();
        setShowModal(false);
        setIsEditing(null);
        setFormData({ name: '', slug: '', image: '', description: '', nameEn: '', descriptionEn: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/admin/destinations?id=${id}`, { method: 'DELETE' });
      setDestinations(prev => prev.filter(d => d._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary uppercase tracking-tight">Destinations</h1>
          <p className="text-sm text-gray-400 font-medium">Manage the countries and regions you operate in.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', slug: '', image: '', description: '', nameEn: '', descriptionEn: '' });
            setIsEditing(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-emerald-900 transition-all shadow-xl shadow-primary/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Destination</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Regions...</p>
          </div>
        ) : destinations.map((dest) => (
          <div key={dest._id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="relative h-48">
              <img src={dest.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={dest.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{dest.name}</h3>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">/{dest.slug}</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                {dest.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setFormData(dest);
                      setIsEditing(dest._id);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(dest._id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link href={`/destination/${dest.slug}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center hover:underline">
                  Preview <ExternalLink className="w-3 h-3 ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-primary uppercase tracking-tight">
                {isEditing ? 'Edit Destination' : 'New Destination'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-primary transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name (English)</label>
                  <input type="text" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Slug</label>
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 text-sm font-bold" />
                </div>
              </div>
              <ImageUpload 
                value={formData.image} 
                onChange={url => setFormData({...formData, image: url})} 
                label="Destination Cover Image" 
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 text-sm font-medium resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description (English)</label>
                <textarea rows={4} value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-3 text-sm font-medium resize-none" />
              </div>
              <button className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:bg-emerald-900 transition-all">
                Save Destination
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
