"use client";

import { useState, useEffect } from 'react';
import { Save, Mail, MessageSquare, Layout, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminContactContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/contact-content')
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
      const res = await fetch('/api/contact-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        setMessage('Contact page content updated successfully!');
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

  const updateNested = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
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
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Contact Page Content</h1>
          <p className="text-gray-400 font-medium italic">Manage titles and text for your contact page.</p>
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
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Hero Description</label>
              <textarea value={content.hero.description} onChange={e => updateNested('hero', 'description', e.target.value)} rows={3} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Hero Description (English)</label>
              <textarea value={content.hero.descriptionEn || ''} onChange={e => updateNested('hero', 'descriptionEn', e.target.value)} rows={3} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">Contact Form Section</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Form Title</label>
              <input value={content.form.title} onChange={e => updateNested('form', 'title', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Form Title (English)</label>
              <input value={content.form.titleEn || ''} onChange={e => updateNested('form', 'titleEn', e.target.value)} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Form Subtitle</label>
              <textarea value={content.form.subtitle} onChange={e => updateNested('form', 'subtitle', e.target.value)} rows={3} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Form Subtitle (English)</label>
              <textarea value={content.form.subtitleEn || ''} onChange={e => updateNested('form', 'subtitleEn', e.target.value)} rows={3} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
          </div>
        </section>

        <div className="xl:col-span-2 p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-4">
          <div className="flex items-center space-x-4 text-emerald-600">
            <Info className="w-6 h-6" />
            <h3 className="text-lg font-black uppercase tracking-tight">Note</h3>
          </div>
          <p className="text-sm text-emerald-700 font-medium leading-relaxed italic">
            Phone numbers, email addresses, and visiting addresses on the contact page are pulled directly from your <b>Global Settings</b>. To change them, please go to the <b>Settings</b> tab in the sidebar.
          </p>
        </div>

      </form>
    </div>
  );
}
