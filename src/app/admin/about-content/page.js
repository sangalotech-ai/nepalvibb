"use client";

import { useState, useEffect } from 'react';
import { Save, Info, Heart, Layout, Image as ImageIcon, Upload, X, Quote, Compass, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAboutContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/about-content')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/about-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        setMessage('About content updated successfully!');
      } else {
        setMessage('Error updating content.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error updating content.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (section, field, file, isNested = true) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        if (isNested) {
          setContent(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              [section]: { ...prev[section], [field]: data.url }
            };
          });
        } else {
          setContent(prev => ({ ...prev, [field]: data.url }));
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const updateNested = (section, field, value) => {
    setContent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: { ...prev[section], [field]: value }
      };
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!content) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <p className="text-lg font-bold text-primary">Failed to load about content</p>
      <p className="text-gray-400 text-sm max-w-md">The content could not be fetched. This is usually a database connection problem on the server.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-all"
      >
        Reload
      </button>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">About Us Page Content</h1>
          <p className="text-gray-400 font-medium italic">Edit your brand story, mission, and core values.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-orange-500 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Lagre Endringer</span>
        </button>
      </div>

      {message && (
        <div className={`p-6 rounded-2xl text-sm font-bold uppercase tracking-widest ${message.includes('Error') ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Hero Section */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">Hero Section</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Main Title</label>
              <input value={content.hero.title} onChange={e => updateNested('hero', 'title', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Main Title (English)</label>
              <input value={content.hero.titleEn || ''} onChange={e => updateNested('hero', 'titleEn', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Subtitle / Badge</label>
              <input value={content.hero.subtitle} onChange={e => updateNested('hero', 'subtitle', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Subtitle / Badge (English)</label>
              <input value={content.hero.subtitleEn || ''} onChange={e => updateNested('hero', 'subtitleEn', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Hero Image</label>
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-3xl border border-dashed border-gray-200">
                <img src={content.hero.image} className="w-20 h-20 object-cover rounded-2xl shadow-md" alt="" />
                <div className="flex-1 space-y-2">
                  <input value={content.hero.image} onChange={e => updateNested('hero', 'image', e.target.value)} className="w-full bg-white border-0 rounded-xl px-4 py-2 text-[10px] font-medium" />
                  <label className="cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-primary/20 transition-all">
                    <Upload className="w-3.5 h-3.5 mr-2" /> Upload Local
                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files[0] && handleFileUpload('hero', 'image', e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">Vår Misjon & Historie</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mission Title</label>
              <input value={content.mission.title} onChange={e => updateNested('mission', 'title', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mission Title (English)</label>
              <input value={content.mission.titleEn || ''} onChange={e => updateNested('mission', 'titleEn', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Description</label>
              <textarea value={content.mission.description} onChange={e => updateNested('mission', 'description', e.target.value)} rows={4} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Description (English)</label>
              <textarea value={content.mission.descriptionEn || ''} onChange={e => updateNested('mission', 'descriptionEn', e.target.value)} rows={4} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Quote className="w-3 h-3 mr-2" /> Inspirerende Sitat</label>
              <input value={content.mission.quote} onChange={e => updateNested('mission', 'quote', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-medium italic italic" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Quote className="w-3 h-3 mr-2" /> Inspirerende Sitat (English)</label>
              <input value={content.mission.quoteEn || ''} onChange={e => updateNested('mission', 'quoteEn', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-medium italic italic" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mission Side Image</label>
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-3xl border border-dashed border-gray-200">
                <img src={content.mission.image} className="w-20 h-20 object-cover rounded-2xl shadow-md" alt="" />
                <div className="flex-1 space-y-2">
                  <input value={content.mission.image} onChange={e => updateNested('mission', 'image', e.target.value)} className="w-full bg-white border-0 rounded-xl px-4 py-2 text-[10px] font-medium" />
                  <label className="cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-primary/20 transition-all">
                    <Upload className="w-3.5 h-3.5 mr-2" /> Upload Local
                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files[0] && handleFileUpload('mission', 'image', e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 lg:col-span-2">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">Nøkkeltall (Stats)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.mission.stats.map((stat, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tall (f.eks 15+)</label>
                  <input 
                    value={stat.number} 
                    onChange={e => {
                      const newStats = [...content.mission.stats];
                      newStats[i].number = e.target.value;
                      updateNested('mission', 'stats', newStats);
                    }} 
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-2xl font-black text-primary italic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Etikett (f.eks Års Erfaring)</label>
                  <input 
                    value={stat.label} 
                    onChange={e => {
                      const newStats = [...content.mission.stats];
                      newStats[i].label = e.target.value;
                      updateNested('mission', 'stats', newStats);
                    }} 
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Etikett (English)</label>
                  <input 
                    value={stat.labelEn || ''} 
                    onChange={e => {
                      const newStats = [...content.mission.stats];
                      newStats[i].labelEn = e.target.value;
                      updateNested('mission', 'stats', newStats);
                    }} 
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 lg:col-span-2">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">Våre Kjerneverdier (Values)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Values Title</label>
              <input value={content.valuesTitle || ''} onChange={e => setContent(prev => ({ ...prev, valuesTitle: e.target.value }))} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Values Title (English)</label>
              <input value={content.valuesTitleEn || ''} onChange={e => setContent(prev => ({ ...prev, valuesTitleEn: e.target.value }))} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Values Subtitle</label>
              <textarea value={content.valuesSubtitle || ''} onChange={e => setContent(prev => ({ ...prev, valuesSubtitle: e.target.value }))} rows={3} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Values Subtitle (English)</label>
              <textarea value={content.valuesSubtitleEn || ''} onChange={e => setContent(prev => ({ ...prev, valuesSubtitleEn: e.target.value }))} rows={3} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(content.values || []).map((value, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value Title</label>
                  <input
                    value={value.title}
                    onChange={e => {
                      const newValues = [...content.values];
                      newValues[i].title = e.target.value;
                      setContent(prev => ({ ...prev, values: newValues }));
                    }}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value Title (English)</label>
                  <input
                    value={value.titleEn || ''}
                    onChange={e => {
                      const newValues = [...content.values];
                      newValues[i].titleEn = e.target.value;
                      setContent(prev => ({ ...prev, values: newValues }));
                    }}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value Description</label>
                  <textarea
                    value={value.desc}
                    onChange={e => {
                      const newValues = [...content.values];
                      newValues[i].desc = e.target.value;
                      setContent(prev => ({ ...prev, values: newValues }));
                    }}
                    rows={3}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-sm font-medium resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value Description (English)</label>
                  <textarea
                    value={value.descEn || ''}
                    onChange={e => {
                      const newValues = [...content.values];
                      newValues[i].descEn = e.target.value;
                      setContent(prev => ({ ...prev, values: newValues }));
                    }}
                    rows={3}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-sm font-medium resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </form>
    </div>
  );
}
