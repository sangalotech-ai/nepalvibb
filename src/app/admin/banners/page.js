"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Image as ImageIcon, 
  ExternalLink, Eye, EyeOff, GripVertical, Save,
  CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';

const DEFAULT_BANNER = {
  title: '',
  titleEn: '',
  subtitle: '',
  subtitleEn: '',
  highlightText: '',
  highlightTextEn: '',
  badgeText: '',
  badgeTextEn: '',
  image: '',
  buttonText: 'TA EN TUR',
  buttonTextEn: 'EXPLORE NOW',
  buttonLink: '/turer',
  videoLink: '',
  order: 0,
  isActive: true
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState(DEFAULT_BANNER);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners?all=true', { cache: 'no-store' });
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenNew = () => {
    setIsEditing('new');
    setFormData({
      ...DEFAULT_BANNER,
      order: banners.length
    });
  };

  const handleOpenEdit = (banner) => {
    setIsEditing(banner);
    setFormData({
      title: banner.title || '',
      titleEn: banner.titleEn || '',
      subtitle: banner.subtitle || '',
      subtitleEn: banner.subtitleEn || '',
      highlightText: banner.highlightText || '',
      highlightTextEn: banner.highlightTextEn || '',
      badgeText: banner.badgeText || '',
      badgeTextEn: banner.badgeTextEn || '',
      image: banner.image || '',
      buttonText: banner.buttonText || 'TA EN TUR',
      buttonTextEn: banner.buttonTextEn || 'EXPLORE NOW',
      buttonLink: banner.buttonLink || '/turer',
      videoLink: banner.videoLink || '',
      order: banner.order ?? 0,
      isActive: banner.isActive !== false
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.image) {
      showStatus('error', 'Please provide at least a title and an image URL.');
      return;
    }

    setSaving(true);
    const isNew = !isEditing || isEditing === 'new' || typeof isEditing === 'string';
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/banners' : `/api/banners/${isEditing._id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        showStatus('success', isNew ? 'New slide created successfully!' : 'Slide updated successfully!');
        setIsEditing(null);
        setFormData(DEFAULT_BANNER);
        await fetchBanners();
      } else {
        throw new Error(data.error || 'Failed to save slide');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', err.message || 'Error saving slide');
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('success', 'Banner deleted successfully!');
        if (isEditing && isEditing._id === id) {
          setIsEditing(null);
        }
        await fetchBanners();
      } else {
        showStatus('error', 'Failed to delete banner');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to delete banner');
    }
  };

  const toggleActive = async (banner) => {
    const isCurrentlyActive = banner.isActive !== false;
    try {
      const res = await fetch(`/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isCurrentlyActive })
      });
      if (res.ok) {
        showStatus('success', `Banner ${!isCurrentlyActive ? 'activated' : 'deactivated'}`);
        await fetchBanners();
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to update banner status');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Homepage Slider</h1>
          <p className="text-gray-400 font-medium">Manage your high-impact hero banners and button links</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
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

      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] border-2 border-primary/10 shadow-2xl shadow-primary/5"
        >
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
            <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">
              {isEditing === 'new' ? 'New Hero Slide' : `Edit Slide: ${formData.title || 'Untitled'}`}
            </h2>
            <button 
              type="button" 
              onClick={() => setIsEditing(null)}
              className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-4">
              <ImageUpload 
                value={formData.image} 
                onChange={url => setFormData({...formData, image: url})} 
                label="Banner Image *" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Badge Text (Norsk)</label>
                <input 
                  type="text" 
                  value={formData.badgeText}
                  onChange={e => setFormData({...formData, badgeText: e.target.value})}
                  placeholder="f.eks. Oppdag Himalaya"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-2">Badge Text (English)</label>
                <input 
                  type="text" 
                  value={formData.badgeTextEn}
                  onChange={e => setFormData({...formData, badgeTextEn: e.target.value})}
                  placeholder="e.g. Discover the Himalayas"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Rekkefølge (Order)</label>
                <input 
                  type="number" 
                  value={formData.order}
                  onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Title (Norsk) *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="f.eks. Uforglemmelige"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Highlighted (Norsk)</label>
                <input 
                  type="text" 
                  value={formData.highlightText}
                  onChange={e => setFormData({...formData, highlightText: e.target.value})}
                  placeholder="f.eks. Kulturelle"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Subtitle (Norsk)</label>
                <input 
                  type="text" 
                  value={formData.subtitle}
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="f.eks. Opplevelser"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-2">Title (English)</label>
                <input 
                  type="text" 
                  value={formData.titleEn}
                  onChange={e => setFormData({...formData, titleEn: e.target.value})}
                  placeholder="e.g. Unforgettable"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-2">Highlighted (English)</label>
                <input 
                  type="text" 
                  value={formData.highlightTextEn}
                  onChange={e => setFormData({...formData, highlightTextEn: e.target.value})}
                  placeholder="e.g. Cultural"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-2">Subtitle (English)</label>
                <input 
                  type="text" 
                  value={formData.subtitleEn}
                  onChange={e => setFormData({...formData, subtitleEn: e.target.value})}
                  placeholder="e.g. Experiences"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Button Text (Norsk)</label>
                <input 
                  type="text" 
                  value={formData.buttonText}
                  onChange={e => setFormData({...formData, buttonText: e.target.value})}
                  placeholder="TA EN TUR"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-2">Button Text (English)</label>
                <input 
                  type="text" 
                  value={formData.buttonTextEn}
                  onChange={e => setFormData({...formData, buttonTextEn: e.target.value})}
                  placeholder="EXPLORE NOW"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Button Link (URL)</label>
                <input 
                  type="text" 
                  value={formData.buttonLink}
                  onChange={e => setFormData({...formData, buttonLink: e.target.value})}
                  placeholder="f.eks. /turer"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Video URL (Optional)</label>
                <input 
                  type="text" 
                  value={formData.videoLink}
                  onChange={e => setFormData({...formData, videoLink: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
              <input 
                type="checkbox"
                id="bannerIsActive"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-5 h-5 text-primary rounded-lg focus:ring-0"
              />
              <label htmlFor="bannerIsActive" className="text-xs font-black uppercase tracking-widest text-primary cursor-pointer">
                Aktiv Slide (vises på forsiden)
              </label>
            </div>

            <div className="flex items-center justify-end space-x-6 pt-6">
              <button 
                type="button" 
                onClick={() => setIsEditing(null)}
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-emerald-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Banner</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {banners.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 text-gray-400 font-medium">
            Ingen bannere lagt til ennå. Klikk &quot;Add New Slide&quot; for å opprette ditt første banner.
          </div>
        ) : (
          banners.map((banner) => {
            const isBannerActive = banner.isActive !== false;
            return (
            <div key={banner._id} className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 group">
              <div className="w-full md:w-48 h-32 md:h-28 rounded-2xl overflow-hidden flex-shrink-0 relative bg-gray-100">
                <img src={banner.image} className="w-full h-full object-cover" alt="" />
                {!isBannerActive && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-black/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5" /> Deaktivert
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {banner.badgeText && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">{banner.badgeText}</p>
                )}
                <h3 className="text-lg font-black text-primary uppercase tracking-tight">
                  {banner.title} {banner.highlightText} {banner.subtitle}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium text-gray-400">
                  <span className="bg-gray-50 px-3 py-1 rounded-lg text-primary font-bold">
                    Knapp: {banner.buttonText || 'TA EN TUR'} → {banner.buttonLink || '/turer'}
                  </span>
                  {banner.order !== undefined && (
                    <span className="bg-gray-50 px-3 py-1 rounded-lg">Rekkefølge: {banner.order}</span>
                  )}
                  {banner.videoLink && (
                    <span className="text-blue-500">Har video</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center">
                <button 
                  type="button"
                  title={isBannerActive ? "Deaktiver slide" : "Aktiver slide"}
                  onClick={() => toggleActive(banner)}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    isBannerActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" : "bg-gray-100 text-gray-400 hover:bg-primary hover:text-white"
                  )}
                >
                  {isBannerActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button 
                  type="button"
                  title="Rediger slide"
                  onClick={() => handleOpenEdit(banner)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  type="button"
                  title="Slett slide"
                  onClick={() => deleteBanner(banner._id)}
                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
