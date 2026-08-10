"use client";

import { useState, useEffect } from 'react';
import { 
  Settings, Save, Mail, Phone, 
  MapPin, Globe, Lock, Shield, 
  CheckCircle2, AlertCircle, Facebook, Instagram, Youtube, Linkedin,
  Plus, Trash2, Link as LinkIcon, Building, Clock, MessageSquare, Info, ShieldCheck
} from 'lucide-react';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAffiliationChange = (index, field, value) => {
    const newAffiliations = [...settings.affiliations];
    newAffiliations[index][field] = value;
    setSettings({ ...settings, affiliations: newAffiliations });
  };

  const addAffiliation = () => {
    setSettings({
      ...settings,
      affiliations: [...(settings.affiliations || []), { name: '', logoUrl: '', url: '' }]
    });
  };

  const removeAffiliation = (index) => {
    setSettings({
      ...settings,
      affiliations: settings.affiliations.filter((_, i) => i !== index)
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Nettsideinnstillinger</h1>
          <p className="text-sm text-gray-400 font-medium italic">Administrer globale variabler, kontaktinfo og footer-innhold.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-orange-500 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Lagre Innstillinger</span>
        </button>
      </div>

      {status.message && (
        <div className={`p-6 rounded-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span className="text-sm font-black uppercase tracking-widest">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Basic Contact Info */}
        <section className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">Kontaktinformasjon</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Norsk Adresse</label>
                <input name="address" value={settings.address} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nepal Adresse</label>
                <input name="kathmanduAddress" value={settings.kathmanduAddress} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">E-post</label>
                <input name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Telefon</label>
                <input name="contactPhone" value={settings.contactPhone} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
          </div>
        </section>

        {/* Subsidiary Info */}
        <section className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
              <Building className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">Datterselskap & Tilknytning</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Tilknyttet Etikett (f.eks. Vi er tilknyttet)</label>
              <input name="affiliatedLabel" value={settings.affiliatedLabel} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Datterselskap Etikett (f.eks. Datterselskap av)</label>
              <input name="subsidiaryLabel" value={settings.subsidiaryLabel} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Logo URL</label>
                <input name="subsidiaryLogo" value={settings.subsidiaryLogo} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nettside URL</label>
                <input name="subsidiaryUrl" value={settings.subsidiaryUrl} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer Support Labels */}
        <section className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-8 shadow-sm lg:col-span-2">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">Footer Støtte-etiketter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Besøksadresse</h3>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase text-gray-400">Overskrift</label>
                <input name="visitingAddressLabel" value={settings.visitingAddressLabel} onChange={handleChange} className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold" />
              </div>
            </div>
            <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Ring Oss</h3>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase text-gray-400">Overskrift</label>
                <input name="callUsLabel" value={settings.callUsLabel} onChange={handleChange} className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold mb-2" />
                <label className="text-[9px] font-bold uppercase text-gray-400">Åpningstider</label>
                <input name="callUsHours" value={settings.callUsHours} onChange={handleChange} className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold" />
              </div>
            </div>
            <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Send E-post</h3>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase text-gray-400">Overskrift</label>
                <input name="sendEmailLabel" value={settings.sendEmailLabel} onChange={handleChange} className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold mb-2" />
                <label className="text-[9px] font-bold uppercase text-gray-400">Svartid</label>
                <input name="replyTimeLabel" value={settings.replyTimeLabel} onChange={handleChange} className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold" />
              </div>
            </div>
          </div>
        </section>

        {/* Chat & Welcome Message */}
        <section className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">Chat & Velkomstmelding</h2>
              <p className="text-gray-400 text-xs font-medium mt-0.5">Konfigurer automatisk første melding sendt fra reisespesialist til nye kunder.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Første velkomstmelding (Spesialist)</label>
              <textarea 
                name="welcomeMessage" 
                value={settings.welcomeMessage || ''} 
                onChange={handleChange} 
                rows={4} 
                placeholder="Hei {name}! Takk for at du planlegger reisen din med Nepalvibb. Jeg har mottatt din forespørsel og ser frem til å hjelpe deg..."
                className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" 
              />
              <p className="text-[11px] text-gray-400 font-medium ml-2">
                💡 Bruk <code className="bg-gray-100 text-primary px-1.5 py-0.5 rounded font-mono font-bold">{"{name}"}</code> for å automatisk sette inn kunden sitt navn.
              </p>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">Sosiale Medier</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Facebook className="w-3 h-3 mr-2" /> Facebook</label>
              <input name="socialLinks.facebook" value={settings.socialLinks?.facebook} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Instagram className="w-3 h-3 mr-2" /> Instagram</label>
              <input name="socialLinks.instagram" value={settings.socialLinks?.instagram} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Youtube className="w-3 h-3 mr-2" /> YouTube</label>
              <input name="socialLinks.youtube" value={settings.socialLinks?.youtube} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Linkedin className="w-3 h-3 mr-2" /> LinkedIn</label>
              <input name="socialLinks.linkedin" value={settings.socialLinks?.linkedin} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
          </div>
        </section>

        {/* Footer About */}
        <section className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">Footer Om Oss & Copyright</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Footer Beskrivelse</label>
              <textarea name="footerAbout" value={settings.footerAbout} onChange={handleChange} rows={3} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Copyright Tekst</label>
              <input name="copyrightText" value={settings.copyrightText} onChange={handleChange} className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" />
            </div>
          </div>
        </section>

        {/* Affiliations */}
        <section className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-8 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-primary uppercase tracking-tight italic">Samarbeidspartnere & Sertifiseringer</h2>
            </div>
            <button 
              onClick={addAffiliation}
              className="px-6 py-3 bg-gray-50 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Legg til logo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {settings.affiliations?.map((aff, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4 relative group">
                <button 
                  onClick={() => removeAffiliation(idx)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-lg border border-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  <input 
                    placeholder="Navn (f.eks. NTB)"
                    value={aff.name}
                    onChange={(e) => handleAffiliationChange(idx, 'name', e.target.value)}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-bold"
                  />
                  <input 
                    placeholder="Logo URL"
                    value={aff.logoUrl}
                    onChange={(e) => handleAffiliationChange(idx, 'logoUrl', e.target.value)}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-medium"
                  />
                  <input 
                    placeholder="Nettside URL (valgfritt)"
                    value={aff.url}
                    onChange={(e) => handleAffiliationChange(idx, 'url', e.target.value)}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 text-xs font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
