"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit2, 
  X, Save, ImageIcon, Mountain,
  Eye, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '@/components/admin/ImageUpload';
import { cn } from '@/lib/utils';

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isFeatured: false,
    nameEn: '',
    descriptionEn: ''
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing && isEditing !== 'new' ? `/api/activities/${isEditing.slug}` : '/api/activities';
    const method = isEditing && isEditing !== 'new' ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(null);
        fetchActivities();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure? This will not delete trips, just the category.')) return;
    try {
      const res = await fetch(`/api/activities/${slug}`, { method: 'DELETE' });
      if (res.ok) fetchActivities();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredActivities = activities.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic">Manage Activities</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Adventure Categories & Sports</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', description: '', image: '', isFeatured: false, nameEn: '', descriptionEn: '' });
            setIsEditing('new');
          }}
          className="bg-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all flex items-center space-x-3"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center space-x-4 bg-gray-50/30">
          <Search className="w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none p-0 text-sm font-medium w-full focus:ring-0 placeholder:text-gray-300"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Featured</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredActivities.map((activity) => (
                <tr key={activity._id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={activity.image || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary uppercase">{activity.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">/{activity.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      activity.isFeatured ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                    )}>
                      {activity.isFeatured ? 'Featured' : 'Standard'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`/activity/${activity.slug}`} target="_blank" className="p-2 text-gray-300 hover:text-blue-500 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => {
                          setIsEditing(activity);
                          setFormData(activity);
                        }}
                        className="p-2 text-gray-300 hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(activity.slug)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-12 space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-primary uppercase italic">
                    {isEditing === 'new' ? 'New Activity' : 'Edit Activity'}
                  </h2>
                  <button type="button" onClick={() => setIsEditing(null)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Activity Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Activity Name (English)</label>
                    <input 
                      type="text" 
                      value={formData.nameEn}
                      onChange={e => setFormData({...formData, nameEn: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Activity Banner</label>
                    <ImageUpload 
                      value={formData.image}
                      onChange={val => setFormData({...formData, image: val})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Description (English)</label>
                    <textarea 
                      value={formData.descriptionEn}
                      onChange={e => setFormData({...formData, descriptionEn: e.target.value})}
                      rows={4}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                    <input 
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                      className="w-5 h-5 text-primary rounded-lg focus:ring-0"
                    />
                    <label htmlFor="isFeatured" className="text-xs font-black uppercase tracking-widest text-primary">Feature this activity on home</label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-6 pt-4">
                  <button type="button" onClick={() => setIsEditing(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">Cancel</button>
                  <button type="submit" className="bg-primary text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all flex items-center space-x-3">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
