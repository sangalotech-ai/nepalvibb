"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit2, 
  X, Save, Mountain,
  Eye, ExternalLink, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '@/components/admin/ImageUpload';
import { cn } from '@/lib/utils';

const DEFAULT_ACTIVITY = {
  name: '',
  nameEn: '',
  slug: '',
  description: '',
  descriptionEn: '',
  image: '',
  isFeatured: false
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState(DEFAULT_ACTIVITY);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities', { cache: 'no-store' });
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showStatus('error', 'Kunne ikke hente aktiviteter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleOpenNew = () => {
    setFormData(DEFAULT_ACTIVITY);
    setIsEditing('new');
  };

  const handleOpenEdit = (activity) => {
    setIsEditing(activity);
    setFormData({
      name: activity.name || '',
      nameEn: activity.nameEn || '',
      slug: activity.slug || '',
      description: activity.description || '',
      descriptionEn: activity.descriptionEn || '',
      image: activity.image || '',
      isFeatured: !!activity.isFeatured
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      showStatus('error', 'Aktivitetsnavn er påkrevd.');
      return;
    }

    setSaving(true);
    const isNew = !isEditing || isEditing === 'new' || typeof isEditing === 'string';
    const url = isNew ? '/api/activities' : `/api/activities/${isEditing.slug}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        showStatus('success', isNew ? 'Aktivitet opprettet!' : 'Aktivitet oppdatert!');
        setIsEditing(null);
        setFormData(DEFAULT_ACTIVITY);
        await fetchActivities();
      } else {
        throw new Error(data.error || 'Kunne ikke lagre aktivitet');
      }
    } catch (error) {
      console.error(error);
      showStatus('error', error.message || 'Feil ved lagring av aktivitet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm('Er du sikker på at du vil slette denne aktiviteten? Dette sletter ikke turene, bare kategorien.')) return;
    try {
      const res = await fetch(`/api/activities/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('success', 'Aktivitet slettet!');
        await fetchActivities();
      } else {
        showStatus('error', 'Kunne ikke slette aktivitet');
      }
    } catch (error) {
      console.error(error);
      showStatus('error', 'Kunne ikke slette aktivitet');
    }
  };

  const filteredActivities = activities.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic">Administrer Aktiviteter</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Opplevelseskategorier & aktiviteter</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all flex items-center space-x-3"
        >
          <Plus className="w-4 h-4" />
          <span>Legg til Aktivitet</span>
        </button>
      </div>

      {status.message && (
        <div className={cn(
          "p-6 rounded-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300",
          status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        )}>
          {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span className="text-sm font-black uppercase tracking-widest">{status.message}</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center space-x-4 bg-gray-50/30">
          <Search className="w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Søk etter aktivitet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none p-0 text-sm font-medium w-full focus:ring-0 placeholder:text-gray-300"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-16 text-center text-gray-400 font-medium">
            Ingen aktiviteter funnet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Aktivitet</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredActivities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                          {activity.image ? (
                            <img src={activity.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Mountain className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-primary uppercase">{activity.name}</p>
                          {activity.nameEn && (
                            <p className="text-xs text-gray-400 font-medium">{activity.nameEn}</p>
                          )}
                          <p className="text-[10px] text-gray-400 font-medium tracking-tight">/activity/{activity.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        activity.isFeatured ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-50 text-gray-400"
                      )}>
                        {activity.isFeatured ? 'Utvalgt på forside' : 'Standard'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a 
                          href={`/activity/${activity.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Åpne på nettsiden"
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleOpenEdit(activity)}
                          title="Rediger aktivitet"
                          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(activity.slug)}
                          title="Slett aktivitet"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(null)}
              className="fixed inset-0 bg-primary/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden my-8 max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-black text-primary uppercase italic">
                    {isEditing === 'new' ? 'Ny Aktivitet' : `Rediger: ${formData.name || 'Aktivitet'}`}
                  </h2>
                  <button type="button" onClick={() => setIsEditing(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Aktivitetsnavn (Norsk) *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="f.eks. Vandring & Fjelltur"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Aktivitetsnavn (Engelsk)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hiking & Trekking"
                        value={formData.nameEn}
                        onChange={e => setFormData({...formData, nameEn: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Slug (URL)</label>
                    <input 
                      type="text" 
                      placeholder="Autogenereres fra navn hvis tom (f.eks. vandring-fjelltur)"
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <ImageUpload 
                      label="Aktivitetsbilde (Banner)"
                      value={formData.image}
                      onChange={val => setFormData({...formData, image: val})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Beskrivelse (Norsk)</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      placeholder="Kort beskrivelse av aktiviteten..."
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Beskrivelse (Engelsk)</label>
                    <textarea 
                      value={formData.descriptionEn}
                      onChange={e => setFormData({...formData, descriptionEn: e.target.value})}
                      rows={4}
                      placeholder="Short description in English..."
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
                    <input 
                      type="checkbox"
                      id="isFeaturedActivity"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                      className="w-5 h-5 text-primary rounded-lg focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="isFeaturedActivity" className="text-xs font-black uppercase tracking-widest text-primary cursor-pointer">
                      Vis denne aktiviteten på forsiden (Featured)
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-6 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(null)} 
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                  >
                    Avbryt
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-primary text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all flex items-center space-x-3 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Lagre Aktivitet</span>
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
