"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Compass, 
  MapPin, Clock, Tag, Search, 
  Save, X, Star, Globe, Info, 
  CheckCircle, XCircle, Image as ImageIcon,
  ChevronRight, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { cn } from '@/lib/utils';

export default function AdminTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    image: '',
    price: '',
    difficulty: 'Moderat',
    duration: '',
    category: ['Trekking'],
    destination: 'Nepal',
    summary: '',
    overview: '',
    highlights: [],
    itinerary: [],
    priceIncludes: [],
    priceExcludes: [],
    gallery: [],
    usefulInfo: {
      bestTime: '',
      accommodation: '',
      meals: '',
      visaInfo: '',
      packingList: ''
    },
    isFeatured: false,
  });

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/admin/trips', { cache: 'no-store' });
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : (data?.tours || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [destRes, actRes] = await Promise.all([
        fetch('/api/destinations', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' })
      ]);
      const destData = await destRes.json();
      const actData = await actRes.json();
      setDestinations(Array.isArray(destData) ? destData : []);
      setActivities(Array.isArray(actData) ? actData : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchOptions();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const isUpdating = isEditing && isEditing !== 'new' && isEditing._id;
    const method = isUpdating ? 'PUT' : 'POST';
    const url = isUpdating ? `/api/admin/trips/${isEditing._id}` : '/api/admin/trips';

    const submitData = { ...formData };
    if (!submitData.slug && submitData.title) {
      submitData.slug = submitData.title
        .toLowerCase()
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(null);
        fetchTrips();
      } else {
        alert("Kunne ikke lagre turen: " + (data.error || "Ukjent feil"));
      }
    } catch (err) {
      console.error(err);
      alert("Feil ved tilkobling til serveren.");
    }
  };

  const deleteTrip = async (id) => {
    if (!confirm('Vil du slette denne turen?')) return;
    try {
      const res = await fetch(`/api/admin/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTrips();
      } else {
        const data = await res.json();
        alert("Kunne ikke slette turen: " + (data.error || "Ukjent feil"));
      }
    } catch (err) {
      console.error(err);
      alert("Feil ved tilkobling til serveren.");
    }
  };

  const addItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const updateItem = (field, index, value) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const [filterDest, setFilterDest] = useState('All');
  const [filterAct, setFilterAct] = useState('All');

  const filteredTrips = trips.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t.destination || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDest = filterDest === 'All' || t.destination === filterDest;
    const matchesAct = filterAct === 'All' || (t.category || []).includes(filterAct);
    return matchesSearch && matchesDest && matchesAct;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Manage Trips</h1>
          <p className="text-gray-400 font-medium">Create and refine your Himalayan journeys</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setIsEditing('new');
              setFormData({
                title: '', slug: '', image: '', price: '',
                difficulty: 'Moderat', duration: '', category: ['Trekking'],
                destination: 'Nepal', summary: '', overview: '',
                highlights: [], itinerary: [], priceIncludes: [],
                priceExcludes: [], gallery: [], usefulInfo: {
                  bestTime: '', accommodation: '', meals: '', visaInfo: '', packingList: ''
                },
                isFeatured: false
              });
            }}
            className="flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-orange-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Trip</span>
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search trips..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={filterDest}
              onChange={e => setFilterDest(e.target.value)}
              className="bg-white border-none rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm focus:ring-2 focus:ring-primary transition-all appearance-none pr-10 min-w-[150px]"
            >
              <option value="All">All Destinations</option>
              {destinations.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
            <select 
              value={filterAct}
              onChange={e => setFilterAct(e.target.value)}
              className="bg-white border-none rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm focus:ring-2 focus:ring-primary transition-all appearance-none pr-10 min-w-[150px]"
            >
              <option value="All">All Activities</option>
              {activities.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] border-2 border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden"
        >
          {/* Editor Header / Tabs */}
          <div className="bg-gray-50/50 border-b border-gray-100 p-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {['basic', 'content', 'itinerary', 'services', 'gallery', 'info'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-primary hover:bg-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsEditing(null)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-10 space-y-12">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div key="basic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <ImageUpload 
                      value={formData.image} 
                      onChange={url => setFormData({...formData, image: url})} 
                      label="Trip Cover Image" 
                    />
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Trip Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" required />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Price (NOK)</label>
                          <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" required />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Duration</label>
                          <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 12 Dager" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Destination</label>
                          <select value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all">
                            {destinations.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {activities.map(a => {
                              const isSelected = (formData.category || []).includes(a.name);
                              return (
                                <button key={a._id} type="button" onClick={() => setFormData({
                                  ...formData,
                                  category: isSelected
                                    ? formData.category.filter(c => c !== a.name)
                                    : [...(formData.category || []), a.name]
                                })} className={`px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all ${isSelected ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-primary/30'}`}>
                                  {a.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'content' && (
                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                  <RichTextEditor label="Short Summary (Frontend cards)" value={formData.summary} onChange={val => setFormData({...formData, summary: val})} />
                  <RichTextEditor label="Full Overview (Main Page)" value={formData.overview} onChange={val => setFormData({...formData, overview: val})} />
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Highlights</h3>
                      <button type="button" onClick={() => addItem('highlights')} className="text-primary hover:text-orange-500 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(formData.highlights || []).map((h, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-2xl">
                          <input value={h} onChange={e => updateItem('highlights', i, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0" placeholder="e.g. Stunning views of Everest" />
                          <button type="button" onClick={() => removeItem('highlights', i)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'itinerary' && (
                <motion.div key="itinerary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Day by Day Schedule</h3>
                    <button type="button" onClick={() => setFormData({...formData, itinerary: [...(formData.itinerary || []), { day: (formData.itinerary?.length || 0) + 1, title: '', details: '' }]})} className="text-primary hover:text-orange-500 transition-colors flex items-center space-x-2">
                      <Plus className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Add Day</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {(formData.itinerary || []).map((item, index) => (
                      <div key={index} className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 flex gap-8">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-primary border border-gray-100 shadow-sm flex-shrink-0">D{item.day}</div>
                        <div className="flex-1 space-y-6">
                          <input type="text" placeholder="Title" value={item.title} onChange={e => {
                            const n = [...formData.itinerary]; n[index].title = e.target.value; setFormData({...formData, itinerary: n});
                          }} className="w-full bg-white border-none rounded-xl px-6 py-3 text-sm font-black text-primary focus:ring-2 focus:ring-primary" />
                          <RichTextEditor value={item.details} onChange={v => {
                            const n = [...formData.itinerary]; n[index].details = v; setFormData({...formData, itinerary: n});
                          }} />
                        </div>
                        <button type="button" onClick={() => {
                          const n = formData.itinerary.filter((_, i) => i !== index).map((it, i) => ({ ...it, day: i + 1 }));
                          setFormData({...formData, itinerary: n});
                        }} className="text-red-400 self-start"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'services' && (
                <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Pris Inkluderer</h3>
                      <button type="button" onClick={() => addItem('priceIncludes')} className="text-emerald-500 hover:text-emerald-700 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-3">
                      {(formData.priceIncludes || []).map((h, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-emerald-50/50 p-4 rounded-xl">
                          <input value={h} onChange={e => updateItem('priceIncludes', i, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0" />
                          <button type="button" onClick={() => removeItem('priceIncludes', i)} className="text-emerald-300"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center"><XCircle className="w-4 h-4 mr-2" /> Pris Ekskluderer</h3>
                      <button type="button" onClick={() => addItem('priceExcludes')} className="text-red-500 hover:text-red-700 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-3">
                      {(formData.priceExcludes || []).map((h, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-red-50/50 p-4 rounded-xl">
                          <input value={h} onChange={e => updateItem('priceExcludes', i, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0" />
                          <button type="button" onClick={() => removeItem('priceExcludes', i)} className="text-red-300"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Image Gallery</h3>
                    <button type="button" onClick={() => setFormData({...formData, gallery: [...(formData.gallery || []), '']})} className="text-primary hover:text-orange-500 transition-colors"><Plus className="w-5 h-5" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {(formData.gallery || []).map((img, i) => (
                      <div key={i} className="relative">
                        <ImageUpload value={img} onChange={v => updateItem('gallery', i, v)} label={`Image ${i+1}`} />
                        <button type="button" onClick={() => removeItem('gallery', i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'info' && (
                <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Beste Reisetid</label>
                    <input type="text" value={formData.usefulInfo?.bestTime} onChange={e => setFormData({...formData, usefulInfo: {...formData.usefulInfo, bestTime: e.target.value}})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary" />
                    
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Overnatting</label>
                    <input type="text" value={formData.usefulInfo?.accommodation} onChange={e => setFormData({...formData, usefulInfo: {...formData.usefulInfo, accommodation: e.target.value}})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary" />
                    
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Måltider</label>
                    <input type="text" value={formData.usefulInfo?.meals} onChange={e => setFormData({...formData, usefulInfo: {...formData.usefulInfo, meals: e.target.value}})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Visum & Forsikring</label>
                    <textarea value={formData.usefulInfo?.visaInfo} onChange={e => setFormData({...formData, usefulInfo: {...formData.usefulInfo, visaInfo: e.target.value}})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary h-32" />
                    
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Pakkeliste Tips</label>
                    <textarea value={formData.usefulInfo?.packingList} onChange={e => setFormData({...formData, usefulInfo: {...formData.usefulInfo, packingList: e.target.value}})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary h-32" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-12 border-t border-gray-50">
              <div className="flex items-center space-x-6">
                <button type="submit" className="bg-emerald-500 text-white px-12 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center space-x-2">
                  <Save className="w-4 h-4" /> <span>Save Trip</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => (
            <div key={trip._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="h-56 relative">
                <img src={trip.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary flex items-center shadow-sm">
                    <MapPin className="w-3 h-3 mr-1.5 text-orange-500" /> {trip.destination}
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 backdrop-blur-[2px]">
                  <button onClick={() => { setIsEditing(trip); setFormData(trip); setActiveTab('basic'); }} className="p-4 bg-white text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl"><Edit3 className="w-5 h-5" /></button>
                  <button onClick={() => deleteTrip(trip._id)} className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-xl"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{Array.isArray(trip.category) ? trip.category[0] : trip.category}</span>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{trip.duration}</span>
                </div>
                <h3 className="text-xl font-black text-primary uppercase tracking-tight line-clamp-1">{trip.title}</h3>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-lg font-black text-primary">NOK {trip.price?.toLocaleString()}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{trip.difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
