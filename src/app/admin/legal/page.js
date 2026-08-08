"use client";

import { useState, useEffect } from 'react';
import { Save, FileText, ShieldCheck } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function AdminLegalPage() {
  const [docs, setDocs] = useState({
    betingelser: { slug: 'betingelser', title: '', content: '', titleEn: '', contentEn: '' },
    personvern: { slug: 'personvern', title: '', content: '', titleEn: '', contentEn: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [termsRes, privacyRes] = await Promise.all([
          fetch('/api/legal/betingelser'),
          fetch('/api/legal/personvern'),
        ]);
        const [terms, privacy] = await Promise.all([termsRes.json(), privacyRes.json()]);
        setDocs({
          betingelser: { slug: 'betingelser', title: terms.title || 'Betingelser', content: terms.content || '', titleEn: terms.titleEn || '', contentEn: terms.contentEn || '' },
          personvern: { slug: 'personvern', title: privacy.title || 'Personvern', content: privacy.content || '', titleEn: privacy.titleEn || '', contentEn: privacy.contentEn || '' },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const updateDoc = (slug, field, value) => {
    setDocs(prev => ({ ...prev, [slug]: { ...prev[slug], [field]: value } }));
  };

  const handleSave = async (slug) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docs[slug]),
      });
      if (res.ok) {
        setMessage(`${docs[slug].title} oppdatert!`);
      } else {
        setMessage('Feil ved lagring.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Feil ved lagring.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const sections = [
    { slug: 'betingelser', label: 'Betingelser', icon: FileText, color: 'bg-blue-50 text-blue-500' },
    { slug: 'personvern', label: 'Personvern', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-500' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Betingelser & Personvern</h1>
          <p className="text-gray-400 font-medium italic">Rediger innholdet som vises på /betingelser og /personvern.</p>
        </div>
      </div>

      {message && (
        <div className="p-6 rounded-2xl text-sm font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {sections.map(({ slug, label, icon: Icon, color }) => (
          <section key={slug} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${color} rounded-2xl`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">{label}</h3>
              </div>
              <button
                onClick={() => handleSave(slug)}
                disabled={saving}
                className="bg-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-orange-500 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Lagre</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Tittel</label>
              <input
                value={docs[slug].title}
                onChange={e => updateDoc(slug, 'title', e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Tittel (English)</label>
              <input
                value={docs[slug].titleEn}
                onChange={e => updateDoc(slug, 'titleEn', e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <RichTextEditor
              value={docs[slug].content}
              onChange={val => updateDoc(slug, 'content', val)}
              label="Innhold"
            />

            <RichTextEditor
              value={docs[slug].contentEn}
              onChange={val => updateDoc(slug, 'contentEn', val)}
              label="Innhold (English)"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
