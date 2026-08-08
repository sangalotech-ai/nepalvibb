"use client";

import { useState, useEffect, useRef } from 'react';
import { Save, Layout, Info, Heart, Newspaper, Map, Activity, Compass, MessageSquare, Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminHomeContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/home-content')
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
      const res = await fetch('/api/home-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        setMessage('Home content updated successfully!');
      } else {
        const errData = await res.json();
        setMessage(`Error: ${errData.error || 'Updating content failed'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error updating content.');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section, field, value) => {
    setContent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleFileUpload = async (section, field, file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        updateSection(section, field, data.url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!content) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <p className="text-lg font-bold text-primary">Failed to load home content</p>
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

  const sections = [
    { id: 'destinations', name: 'Destinations Section', icon: Map },
    { id: 'activities', name: 'Activities Section', icon: Activity },
    { id: 'whoWeAre', name: 'Who We Are Section', icon: Info, hasDescription: true, hasYears: true, images: ['image1', 'image2'] },
    { id: 'tours', name: 'Popular Tours Section', icon: Compass },
    { id: 'purpose', name: 'Purpose/CSR Section', icon: Heart, hasDescription: true, hasButton: true, images: ['image'] },
    { id: 'testimonials', name: 'Testimonials Section', icon: MessageSquare },
    { id: 'blog', name: 'Blog/News Section', icon: Newspaper },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Home Page Content</h1>
          <p className="text-gray-400 font-medium">Manage all dynamic content and images</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-6 rounded-2xl text-sm font-bold uppercase tracking-widest ${message.includes('Error') ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {sections.map((section) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-primary">
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">{section.name}</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Subtitle / Badge</label>
                <input 
                  type="text" 
                  value={content[section.id]?.subtitle || ''}
                  onChange={e => updateSection(section.id, 'subtitle', e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Subtitle / Badge (English)</label>
                <input 
                  type="text" 
                  value={content[section.id]?.subtitleEn || ''}
                  onChange={e => updateSection(section.id, 'subtitleEn', e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Main Title</label>
                <input 
                  type="text" 
                  value={content[section.id]?.title || ''}
                  onChange={e => updateSection(section.id, 'title', e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Main Title (English)</label>
                <input 
                  type="text" 
                  value={content[section.id]?.titleEn || ''}
                  onChange={e => updateSection(section.id, 'titleEn', e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              {section.images?.map(imgField => (
                <div key={imgField} className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">
                    {imgField === 'image' ? 'Background Image' : imgField === 'image1' ? 'First Image' : 'Second Image'}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50 p-4 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                      {content[section.id]?.[imgField] ? (
                        <img src={content[section.id][imgField]} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <input 
                        type="text" 
                        value={content[section.id]?.[imgField] || ''}
                        onChange={e => updateSection(section.id, imgField, e.target.value)}
                        className="w-full bg-white border-none rounded-xl px-4 py-2 text-[10px] font-medium focus:ring-1 focus:ring-primary transition-all"
                        placeholder="Image URL"
                      />
                      <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all">
                          <Upload className="w-3.5 h-3.5 mr-2" />
                          Upload Local
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleFileUpload(section.id, imgField, e.target.files[0])}
                          />
                        </label>
                        {content[section.id]?.[imgField] && (
                          <button 
                            onClick={() => updateSection(section.id, imgField, '')}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {section.hasYears && (
                <div className="space-y-6 pt-4 border-t border-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Years of Experience (Number)</label>
                      <input 
                        type="text" 
                        value={content[section.id]?.yearsOfExperience || ''}
                        onChange={e => updateSection(section.id, 'yearsOfExperience', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Experience Label (Text)</label>
                      <input 
                        type="text" 
                        value={content[section.id]?.yearsOfExperienceLabel || ''}
                        onChange={e => updateSection(section.id, 'yearsOfExperienceLabel', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Experience Label (English)</label>
                      <input 
                        type="text" 
                        value={content[section.id]?.yearsOfExperienceLabelEn || ''}
                        onChange={e => updateSection(section.id, 'yearsOfExperienceLabelEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Feature Box 1</h4>
                      <input 
                        placeholder="Title"
                        value={content[section.id]?.feature1Title || ''}
                        onChange={e => updateSection(section.id, 'feature1Title', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        placeholder="Title (English)"
                        value={content[section.id]?.feature1TitleEn || ''}
                        onChange={e => updateSection(section.id, 'feature1TitleEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        placeholder="Description"
                        value={content[section.id]?.feature1Desc || ''}
                        onChange={e => updateSection(section.id, 'feature1Desc', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        placeholder="Description (English)"
                        value={content[section.id]?.feature1DescEn || ''}
                        onChange={e => updateSection(section.id, 'feature1DescEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Feature Box 2</h4>
                      <input 
                        placeholder="Title"
                        value={content[section.id]?.feature2Title || ''}
                        onChange={e => updateSection(section.id, 'feature2Title', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        placeholder="Title (English)"
                        value={content[section.id]?.feature2TitleEn || ''}
                        onChange={e => updateSection(section.id, 'feature2TitleEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        placeholder="Description"
                        value={content[section.id]?.feature2Desc || ''}
                        onChange={e => updateSection(section.id, 'feature2Desc', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        placeholder="Description (English)"
                        value={content[section.id]?.feature2DescEn || ''}
                        onChange={e => updateSection(section.id, 'feature2DescEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {section.hasDescription && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Description Text</label>
                  <textarea 
                    rows={4}
                    value={content[section.id]?.description || ''}
                    onChange={e => updateSection(section.id, 'description', e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                </div>
              )}

              {section.hasDescription && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Description Text (English)</label>
                  <textarea 
                    rows={4}
                    value={content[section.id]?.descriptionEn || ''}
                    onChange={e => updateSection(section.id, 'descriptionEn', e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                </div>
              )}

              {section.hasButton && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Button Text</label>
                  <input 
                    type="text" 
                    value={content[section.id]?.buttonText || ''}
                    onChange={e => updateSection(section.id, 'buttonText', e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              )}

              {section.hasButton && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Button Text (English)</label>
                  <input 
                    type="text" 
                    value={content[section.id]?.buttonTextEn || ''}
                    onChange={e => updateSection(section.id, 'buttonTextEn', e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              )}

              {section.id === 'purpose' && (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Long Description (HTML)</label>
                    <textarea 
                      rows={5}
                      value={content[section.id]?.longDescription || ''}
                      onChange={e => updateSection(section.id, 'longDescription', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Long Description (English)</label>
                    <textarea 
                      rows={5}
                      value={content[section.id]?.longDescriptionEn || ''}
                      onChange={e => updateSection(section.id, 'longDescriptionEn', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Mission Statement</label>
                    <input 
                      type="text" 
                      value={content[section.id]?.mission || ''}
                      onChange={e => updateSection(section.id, 'mission', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Mission Statement (English)</label>
                    <input 
                      type="text" 
                      value={content[section.id]?.missionEn || ''}
                      onChange={e => updateSection(section.id, 'missionEn', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Button Link</label>
                    <input 
                      type="text" 
                      value={content[section.id]?.buttonLink || ''}
                      onChange={e => updateSection(section.id, 'buttonLink', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Travelers Count (e.g. "200+")</label>
                    <input 
                      type="text" 
                      value={content[section.id]?.travelersValue || ''}
                      onChange={e => updateSection(section.id, 'travelersValue', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Travelers Label</label>
                    <input 
                      type="text" 
                      value={content[section.id]?.travelersLabel || ''}
                      onChange={e => updateSection(section.id, 'travelersLabel', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Travelers Label (English)</label>
                    <input 
                      type="text" 
                      value={content[section.id]?.travelersLabelEn || ''}
                      onChange={e => updateSection(section.id, 'travelersLabelEn', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Stats (JSON array)</label>
                    <textarea 
                      rows={4}
                      value={content[section.id]?.stats || ''}
                      onChange={e => updateSection(section.id, 'stats', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                      placeholder='[{"number":"2000+","label":"Hunder sterilisert"},...]'
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Stats (English) (JSON array)</label>
                    <textarea 
                      rows={4}
                      value={content[section.id]?.statsEn || ''}
                      onChange={e => updateSection(section.id, 'statsEn', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                      placeholder='[{"number":"2000+","label":"Dogs sterilized"},...]'
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Gallery Images (JSON array of URLs)</label>
                    <textarea 
                      rows={3}
                      value={content[section.id]?.images || ''}
                      onChange={e => updateSection(section.id, 'images', e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                      placeholder='["url1","url2",...]'
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Hero Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA 1 Text</label>
                        <input type="text" value={content[section.id]?.heroCta1Text || ''} onChange={e => updateSection(section.id, 'heroCta1Text', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA 1 Text (English)</label>
                        <input type="text" value={content[section.id]?.heroCta1TextEn || ''} onChange={e => updateSection(section.id, 'heroCta1TextEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA 1 Link</label>
                        <input type="text" value={content[section.id]?.heroCta1Link || ''} onChange={e => updateSection(section.id, 'heroCta1Link', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA 2 Text</label>
                        <input type="text" value={content[section.id]?.heroCta2Text || ''} onChange={e => updateSection(section.id, 'heroCta2Text', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA 2 Text (English)</label>
                        <input type="text" value={content[section.id]?.heroCta2TextEn || ''} onChange={e => updateSection(section.id, 'heroCta2TextEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA 2 Link</label>
                        <input type="text" value={content[section.id]?.heroCta2Link || ''} onChange={e => updateSection(section.id, 'heroCta2Link', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Misjon Strip</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Label</label>
                        <input type="text" value={content[section.id]?.missionLabel || ''} onChange={e => updateSection(section.id, 'missionLabel', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Label (English)</label>
                        <input type="text" value={content[section.id]?.missionLabelEn || ''} onChange={e => updateSection(section.id, 'missionLabelEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA Button Text</label>
                        <input type="text" value={content[section.id]?.missionCtaText || ''} onChange={e => updateSection(section.id, 'missionCtaText', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA Button Text (English)</label>
                        <input type="text" value={content[section.id]?.missionCtaTextEn || ''} onChange={e => updateSection(section.id, 'missionCtaTextEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">CTA Button Link</label>
                        <input type="text" value={content[section.id]?.missionCtaLink || ''} onChange={e => updateSection(section.id, 'missionCtaLink', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Historie / Story</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label</label>
                        <input type="text" value={content[section.id]?.storyLabel || ''} onChange={e => updateSection(section.id, 'storyLabel', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label (English)</label>
                        <input type="text" value={content[section.id]?.storyLabelEn || ''} onChange={e => updateSection(section.id, 'storyLabelEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title</label>
                        <input type="text" value={content[section.id]?.storyTitle || ''} onChange={e => updateSection(section.id, 'storyTitle', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title (English)</label>
                        <input type="text" value={content[section.id]?.storyTitleEn || ''} onChange={e => updateSection(section.id, 'storyTitleEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Badge Text (Siden XXXX)</label>
                        <input type="text" value={content[section.id]?.sinceText || ''} onChange={e => updateSection(section.id, 'sinceText', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Badge Text (English)</label>
                        <input type="text" value={content[section.id]?.sinceTextEn || ''} onChange={e => updateSection(section.id, 'sinceTextEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Badge Description</label>
                        <input type="text" value={content[section.id]?.sinceDesc || ''} onChange={e => updateSection(section.id, 'sinceDesc', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Badge Description (English)</label>
                        <input type="text" value={content[section.id]?.sinceDescEn || ''} onChange={e => updateSection(section.id, 'sinceDescEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Feature Pills (JSON array of labels)</label>
                      <textarea
                        rows={2}
                        value={content[section.id]?.featurePills || ''}
                        onChange={e => updateSection(section.id, 'featurePills', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder='["Gatehunder reddet","Lokalsamfunn","Bærekraft"]'
                      />
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Feature Pills (English) (JSON array of labels)</label>
                      <textarea
                        rows={2}
                        value={content[section.id]?.featurePillsEn || ''}
                        onChange={e => updateSection(section.id, 'featurePillsEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder='["Dogs saved","Local communities","Sustainability"]'
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Påvirkning / Impact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label</label>
                        <input type="text" value={content[section.id]?.impactLabel || ''} onChange={e => updateSection(section.id, 'impactLabel', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label (English)</label>
                        <input type="text" value={content[section.id]?.impactLabelEn || ''} onChange={e => updateSection(section.id, 'impactLabelEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title</label>
                        <input type="text" value={content[section.id]?.impactTitle || ''} onChange={e => updateSection(section.id, 'impactTitle', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title (English)</label>
                        <input type="text" value={content[section.id]?.impactTitleEn || ''} onChange={e => updateSection(section.id, 'impactTitleEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Slik Fungerer Det / Steps</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label</label>
                        <input type="text" value={content[section.id]?.howLabel || ''} onChange={e => updateSection(section.id, 'howLabel', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label (English)</label>
                        <input type="text" value={content[section.id]?.howLabelEn || ''} onChange={e => updateSection(section.id, 'howLabelEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title</label>
                        <input type="text" value={content[section.id]?.howTitle || ''} onChange={e => updateSection(section.id, 'howTitle', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title (English)</label>
                        <input type="text" value={content[section.id]?.howTitleEn || ''} onChange={e => updateSection(section.id, 'howTitleEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Description</label>
                      <textarea
                        rows={2}
                        value={content[section.id]?.howDescription || ''}
                        onChange={e => updateSection(section.id, 'howDescription', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                      />
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Description (English)</label>
                      <textarea
                        rows={2}
                        value={content[section.id]?.howDescriptionEn || ''}
                        onChange={e => updateSection(section.id, 'howDescriptionEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                      />
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Steps (JSON array of {title, desc})</label>
                      <textarea
                        rows={4}
                        value={content[section.id]?.steps || ''}
                        onChange={e => updateSection(section.id, 'steps', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder='[{"title":"Book Din Reise","desc":"..."}]'
                      />
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Steps (English) (JSON array of {title, desc})</label>
                      <textarea
                        rows={4}
                        value={content[section.id]?.stepsEn || ''}
                        onChange={e => updateSection(section.id, 'stepsEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder='[{"title":"Book Your Trip","desc":"..."}]'
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Bildegalleri / Gallery</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label</label>
                        <input type="text" value={content[section.id]?.galleryLabel || ''} onChange={e => updateSection(section.id, 'galleryLabel', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Label (English)</label>
                        <input type="text" value={content[section.id]?.galleryLabelEn || ''} onChange={e => updateSection(section.id, 'galleryLabelEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title</label>
                        <input type="text" value={content[section.id]?.galleryTitle || ''} onChange={e => updateSection(section.id, 'galleryTitle', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Section Title (English)</label>
                        <input type="text" value={content[section.id]?.galleryTitleEn || ''} onChange={e => updateSection(section.id, 'galleryTitleEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Gallery Images (JSON array of URLs) — separate from story images</label>
                      <textarea
                        rows={3}
                        value={content[section.id]?.galleryImages || ''}
                        onChange={e => updateSection(section.id, 'galleryImages', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder='["url1","url2",...]'
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">CTA Section</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Badge Text</label>
                        <input type="text" value={content[section.id]?.ctaBadge || ''} onChange={e => updateSection(section.id, 'ctaBadge', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Badge Text (English)</label>
                        <input type="text" value={content[section.id]?.ctaBadgeEn || ''} onChange={e => updateSection(section.id, 'ctaBadgeEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Title (use {`{highlight}`} placeholder)</label>
                        <input type="text" value={content[section.id]?.ctaTitle || ''} onChange={e => updateSection(section.id, 'ctaTitle', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Title (English) (use {`{highlight}`} placeholder)</label>
                        <input type="text" value={content[section.id]?.ctaTitleEn || ''} onChange={e => updateSection(section.id, 'ctaTitleEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Highlight Word</label>
                        <input type="text" value={content[section.id]?.ctaTitleHighlight || ''} onChange={e => updateSection(section.id, 'ctaTitleHighlight', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Highlight Word (English)</label>
                        <input type="text" value={content[section.id]?.ctaTitleHighlightEn || ''} onChange={e => updateSection(section.id, 'ctaTitleHighlightEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Primary Button Text</label>
                        <input type="text" value={content[section.id]?.ctaButtonText || ''} onChange={e => updateSection(section.id, 'ctaButtonText', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Primary Button Text (English)</label>
                        <input type="text" value={content[section.id]?.ctaButtonTextEn || ''} onChange={e => updateSection(section.id, 'ctaButtonTextEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Primary Button Link</label>
                        <input type="text" value={content[section.id]?.ctaButtonLink || ''} onChange={e => updateSection(section.id, 'ctaButtonLink', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Secondary Button Text</label>
                        <input type="text" value={content[section.id]?.ctaSecondaryText || ''} onChange={e => updateSection(section.id, 'ctaSecondaryText', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Secondary Button Text (English)</label>
                        <input type="text" value={content[section.id]?.ctaSecondaryTextEn || ''} onChange={e => updateSection(section.id, 'ctaSecondaryTextEn', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Secondary Button Link</label>
                        <input type="text" value={content[section.id]?.ctaSecondaryLink || ''} onChange={e => updateSection(section.id, 'ctaSecondaryLink', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Description</label>
                      <textarea
                        rows={3}
                        value={content[section.id]?.ctaDescription || ''}
                        onChange={e => updateSection(section.id, 'ctaDescription', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                      />
                    </div>
                    <div className="space-y-3 mt-6">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Description (English)</label>
                      <textarea
                        rows={3}
                        value={content[section.id]?.ctaDescriptionEn || ''}
                        onChange={e => updateSection(section.id, 'ctaDescriptionEn', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
