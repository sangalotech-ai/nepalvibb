"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, GripVertical, 
  CheckCircle2, XCircle, Layout, Save,
  PlusCircle, ChevronRight, Settings, Info,
  Mountain, Globe, Sparkles, Zap, MapPin, User, Users
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';

const ICON_OPTIONS = [
  { name: 'Mountain', icon: Mountain },
  { name: 'Globe', icon: Globe },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Zap', icon: Zap },
  { name: 'MapPin', icon: MapPin },
  { name: 'User', icon: User },
  { name: 'Users', icon: Users },
  { name: 'Info', icon: Info },
  { name: 'Settings', icon: Settings },
];

export default function AdminPlanTripPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/plan-trip/questions', { cache: 'no-store' });
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      _id: 'temp-' + Date.now(),
      question: 'Nytt Spørsmål',
      description: 'Legg til en beskrivelse her',
      type: 'select',
      options: [{ label: 'Alternativ 1', value: 'alt1', icon: 'Mountain' }],
      isActive: true,
      order: questions.length
    };
    setQuestions([...questions, newQuestion]);
    setEditingId(newQuestion._id);
  };

  const handleSave = async (question) => {
    setIsSaving(true);
    try {
      const isNew = question._id.toString().startsWith('temp-');
      const res = await fetch('/api/admin/plan-trip/questions', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? { ...question, _id: undefined } : { ...question, id: question._id })
      });
      if (res.ok) {
        await fetchQuestions();
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Vil du slette dette spørsmålet?')) return;
    try {
      if (id.toString().startsWith('temp-')) {
        setQuestions(questions.filter(q => q._id !== id));
        return;
      }
      const res = await fetch(`/api/admin/plan-trip/questions?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q._id === id ? { ...q, [field]: value } : q));
  };

  const addOption = (qId) => {
    setQuestions(questions.map(q => {
      if (q._id === qId) {
        return { ...q, options: [...q.options, { label: 'Nytt valg', value: 'valg-' + Date.now(), icon: 'Mountain' }] };
      }
      return q;
    }));
  };

  const updateOption = (qId, optIdx, field, value) => {
    setQuestions(questions.map(q => {
      if (q._id === qId) {
        const newOptions = [...q.options];
        newOptions[optIdx] = { ...newOptions[optIdx], [field]: value };
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (qId, optIdx) => {
    setQuestions(questions.map(q => {
      if (q._id === qId) {
        return { ...q, options: q.options.filter((_, i) => i !== optIdx) };
      }
      return q;
    }));
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Reiseplanlegger Form</h1>
          <p className="text-gray-400 font-medium italic">Administrer spørsmålene i multi-step formen.</p>
        </div>
        <button 
          onClick={handleAddQuestion}
          className="bg-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-orange-500 transition-all flex items-center space-x-3"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Legg til Spørsmål</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <motion.div 
              key={q._id}
              layout
              className={cn(
                "bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all",
                editingId === q._id ? "ring-2 ring-primary border-transparent" : "hover:border-gray-200"
              )}
            >
              <div className="p-8 flex items-start justify-between gap-8">
                <div className="flex-1 space-y-4">
                  {editingId === q._id ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Spørsmål</label>
                          <input 
                            value={q.question}
                            onChange={(e) => updateQuestion(q._id, 'question', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Type</label>
                          <select 
                            value={q.type}
                            onChange={(e) => updateQuestion(q._id, 'type', e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary"
                          >
                            <option value="select">Enkeltvalg</option>
                            <option value="multi-select">Flerivvalg</option>
                            <option value="text">Tekstfelt</option>
                            <option value="date">Dato</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Beskrivelse</label>
                        <textarea 
                          value={q.description}
                          onChange={(e) => updateQuestion(q._id, 'description', e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>

                      {q.type !== 'text' && q.type !== 'date' && (
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Alternativer</label>
                          <div className="grid grid-cols-1 gap-4">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <input 
                                    placeholder="Label"
                                    value={opt.label}
                                    onChange={(e) => updateOption(q._id, optIdx, 'label', e.target.value)}
                                    className="bg-white border-none rounded-lg px-4 py-2 text-xs font-bold"
                                  />
                                  <input 
                                    placeholder="Value"
                                    value={opt.value}
                                    onChange={(e) => updateOption(q._id, optIdx, 'value', e.target.value)}
                                    className="bg-white border-none rounded-lg px-4 py-2 text-xs font-bold"
                                  />
                                  <select 
                                    value={opt.icon}
                                    onChange={(e) => updateOption(q._id, optIdx, 'icon', e.target.value)}
                                    className="bg-white border-none rounded-lg px-4 py-2 text-xs font-bold"
                                  >
                                    {ICON_OPTIONS.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                  </select>
                                </div>
                                <button onClick={() => removeOption(q._id, optIdx)} className="text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => addOption(q._id)}
                              className="flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-primary/20 hover:text-primary transition-all"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Legg til valg</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-black text-primary uppercase italic tracking-tight">{q.question}</h3>
                        <span className="px-3 py-1 rounded-full bg-primary/5 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10">{q.type}</span>
                      </div>
                      <p className="text-sm text-gray-400 font-medium italic">{q.description}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {q.options.map((opt, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg bg-gray-50 text-[9px] font-bold text-gray-400 border border-gray-100">{opt.label}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {editingId === q._id ? (
                    <button 
                      onClick={() => handleSave(q)}
                      disabled={isSaving}
                      className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEditingId(q._id)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(q._id)}
                    className="p-3 bg-gray-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
