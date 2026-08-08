"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Save, ArrowLeft, Image as ImageIcon, 
  Clock, MapPin, DollarSign, List,
  Trash2, Star
} from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';


export default function EditTourPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchTour();
  }, [id]);

  const fetchTour = async () => {
    try {
      const res = await fetch(`/api/admin/trips/${id}`);
      if (!res.ok) throw new Error('Tour not found');
      const data = await res.json();
      
      // Transform Mongoose schema fields to frontend states
      const loadedData = {
        ...data,
        days: parseInt(data.duration) || 7,
        inclusions: data.priceIncludes || [],
        inclusionsEn: data.priceIncludesEn || [],
        exclusions: data.priceExcludes || [],
        exclusionsEn: data.priceExcludesEn || [],
        briefItinerary: data.itinerary?.map(it => ({ day: it.day, highlight: it.title, overnight: '' })) || [],
        detailedItinerary: data.itinerary?.map(it => ({ day: it.day, title: it.title, titleEn: it.titleEn, desc: it.details, descEn: it.detailsEn, image: it.image || '' })) || []
      };
      
      setFormData(loadedData);
    } catch (error) {
      console.error(error);
      alert('Error fetching tour');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], item]
    }));
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field, index, key, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      if (typeof newArray[index] === 'object') {
        newArray[index] = { ...newArray[index], [key]: value };
      } else {
        newArray[index] = value;
      }
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Map frontend fields to MongoDB TourSchema fields
      const submitData = {
        ...formData,
        duration: `${formData.days} Dager`, // duration is required
        priceIncludes: formData.inclusions.filter(Boolean),
        priceIncludesEn: formData.inclusionsEn?.filter(Boolean),
        priceExcludes: formData.exclusions.filter(Boolean),
        priceExcludesEn: formData.exclusionsEn?.filter(Boolean),
        itinerary: formData.detailedItinerary.map(item => ({
          day: item.day,
          title: item.title,
          titleEn: item.titleEn,
          details: item.desc,
          detailsEn: item.descEn,
          image: item.image
        }))
      };

      const response = await fetch(`/api/admin/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tour');
      }
      
      router.push('/admin/trips');
    } catch (error) {
      console.error(error);
      alert(`Error saving tour: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between sticky top-[64px] bg-gray-50/80 backdrop-blur-md py-4 z-30">
        <div className="flex items-center space-x-4">
          <Link href="/admin/trips" className="p-2 bg-white border border-gray-100 rounded-xl hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-primary uppercase tracking-tight">Edit Tour</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Updating: {formData.title}</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-emerald-900 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Update Tour</span>
        </button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Basics Card */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">General Information</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tour Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Tour Title (English)</label>
                <input 
                  type="text" 
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-3 text-xs font-bold focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Destination</label>
                  <select name="destination" value={formData.destination} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-3 text-xs font-bold focus:outline-none focus:border-primary appearance-none">
                    <option>Nepal</option>
                    <option>Bhutan</option>
                    <option>Tibet</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Destination (English)</label>
                  <input type="text" name="destinationEn" value={formData.destinationEn} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-3 text-xs font-bold focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tour Summary</label>
                <textarea rows={4} name="summary" value={formData.summary} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Tour Summary (English)</label>
                <textarea rows={4} name="summaryEn" value={formData.summaryEn} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>
            </div>
          </section>

          {/* Dynamic Trip Details */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Compass className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Turdetaljer (Fakta)</h2>
              </div>
              <button 
                type="button" 
                onClick={() => addItem('tripDetails', { label: '', labelEn: '', value: '', valueEn: '', icon: 'Clock' })}
                className="text-[10px] font-black text-primary hover:underline flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" /> Legg til fakta
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(formData.tripDetails || []).map((detail, index) => (
                <div key={index} className="bg-gray-50/50 p-6 rounded-3xl space-y-4 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeItem('tripDetails', index)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Label</label>
                      <input 
                        placeholder="F.eks. Varighet"
                        value={detail.label}
                        onChange={(e) => updateArrayItem('tripDetails', index, 'label', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Ikon</label>
                      <select 
                        value={detail.icon}
                        onChange={(e) => updateArrayItem('tripDetails', index, 'icon', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold"
                      >
                        <option value="Clock">Clock</option>
                        <option value="Mountain">Mountain</option>
                        <option value="Users">Users</option>
                        <option value="MapPin">MapPin</option>
                        <option value="Globe">Globe</option>
                        <option value="Calendar">Calendar</option>
                        <option value="Compass">Compass</option>
                        <option value="Zap">Zap</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-blue-500 ml-1">Label (English)</label>
                      <input 
                        placeholder="e.g. Duration"
                        value={detail.labelEn}
                        onChange={(e) => updateArrayItem('tripDetails', index, 'labelEn', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Verdi</label>
                    <input 
                      placeholder="F.eks. 14 Dager"
                      value={detail.value}
                      onChange={(e) => updateArrayItem('tripDetails', index, 'value', e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-blue-500 ml-1">Verdi (English)</label>
                    <input 
                      placeholder="e.g. 14 Days"
                      value={detail.valueEn}
                      onChange={(e) => updateArrayItem('tripDetails', index, 'valueEn', e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Brief Itinerary */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-8">
            <div className="flex items-center justify-between text-gray-400 uppercase tracking-widest">
              <div className="flex items-center space-x-3">
                <List className="w-4 h-4 text-blue-500" />
                <h2 className="text-[11px] font-black">Brief Itinerary</h2>
              </div>
              <button type="button" onClick={() => addItem('briefItinerary', { day: formData.briefItinerary.length + 1, highlight: '', overnight: '' })} className="text-[10px] font-black text-primary hover:underline">Add Day</button>
            </div>
            <div className="space-y-4">
              {formData.briefItinerary.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl">
                  <div className="col-span-1 text-center"><p className="text-xs font-black text-primary">{item.day}</p></div>
                  <div className="col-span-7"><input type="text" value={item.highlight} onChange={(e) => updateArrayItem('briefItinerary', index, 'highlight', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg px-4 py-2 text-xs font-bold" /></div>
                  <div className="col-span-3"><input type="text" value={item.overnight} onChange={(e) => updateArrayItem('briefItinerary', index, 'overnight', e.target.value)} className="w-full bg-white border border-gray-100 rounded-lg px-4 py-2 text-xs font-bold" /></div>
                  <div className="col-span-1 text-center"><button type="button" onClick={() => removeItem('briefItinerary', index)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed Itinerary */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-8">
             <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Detailed Itinerary</h2>
              </div>
              <button type="button" onClick={() => addItem('detailedItinerary', { day: formData.detailedItinerary.length + 1, title: '', titleEn: '', desc: '', descEn: '', image: '' })} className="text-[10px] font-black text-primary hover:underline">Add Story Block</button>
            </div>
            <div className="space-y-10">
              {formData.detailedItinerary.map((item, index) => (
                <div key={index} className="space-y-6 bg-gray-50/50 p-6 rounded-3xl relative">
                  <button type="button" onClick={() => removeItem('detailedItinerary', index)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">{item.day}</div>
                    <input type="text" value={item.title} onChange={(e) => updateArrayItem('detailedItinerary', index, 'title', e.target.value)} className="flex-1 bg-white border border-gray-100 rounded-xl px-6 py-3 text-sm font-black text-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-blue-500">Day Title (English)</label>
                    <input type="text" value={item.titleEn} onChange={(e) => updateArrayItem('detailedItinerary', index, 'titleEn', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-6 py-3 text-sm font-black text-primary" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <textarea rows={6} value={item.desc} onChange={(e) => updateArrayItem('detailedItinerary', index, 'desc', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-xs font-medium resize-none" />
                    <div className="space-y-4">
                      <ImageUpload 
                        value={item.image} 
                        onChange={url => updateArrayItem('detailedItinerary', index, 'image', url)} 
                        label="Itinerary Image" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-blue-500">Description (English)</label>
                    <textarea rows={6} value={item.descEn} onChange={(e) => updateArrayItem('detailedItinerary', index, 'descEn', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-xs font-medium resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-8 sticky top-28">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-4 h-4 text-purple-500" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Settings & Pricing</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base Price (NOK)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-3 text-sm font-black text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</label>
                  <input type="number" name="days" value={formData.days} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-3 text-sm font-black text-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Difficulty</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-3 text-xs font-bold appearance-none">
                    <option>Easy</option><option>Moderate</option><option>Challenging</option><option>Difficult</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Difficulty (English)</label>
                  <input type="text" name="difficultyEn" value={formData.difficultyEn} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-6 py-3 text-xs font-bold" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div><p className="text-xs font-black text-primary uppercase">Featured Tour</p><p className="text-[9px] text-gray-400 uppercase">Show on home page</p></div>
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 accent-primary" />
              </div>
              <ImageUpload 
                value={formData.image} 
                onChange={url => setFormData(prev => ({ ...prev, image: url }))} 
                label="Trip Cover Image" 
              />
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
