"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, 
  Upload, Image as ImageIcon, Facebook, 
  Instagram, Linkedin, Twitter, Users, MoveUp, MoveDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/team-members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember({ ...member });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingMember({
      name: '',
      role: '',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      bio: '',
      order: members.length,
      socialLinks: { facebook: '', instagram: '', linkedin: '', twitter: '' }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Er du sikker på at du vil slette dette teammedlemmet?')) return;
    try {
      const res = await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Kunne ikke slette teammedlemmet.');
        return;
      }
      fetchMembers();
    } catch (error) {
      console.error(error);
      alert('Kunne ikke slette teammedlemmet.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingMember._id ? 'PUT' : 'POST';
      const url = editingMember._id ? `/api/team-members/${editingMember._id}` : '/api/team-members';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchMembers();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setEditingMember({ ...editingMember, image: data.url });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveMember = async (index, direction) => {
    const newMembers = [...members];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newMembers.length) return;

    // Swap positions
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    // Update order values locally
    const updated = newMembers.map((m, i) => ({ ...m, order: i }));
    setMembers(updated);

    // Save all to persist order (simple way for this exercise)
    for (const m of updated) {
      await fetch(`/api/team-members/${m._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: m.order }),
      });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Vårt Team</h1>
          <p className="text-gray-400 font-medium italic">Administrer ansatte, guider og eksperter.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-orange-500 transition-all shadow-xl shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Legg til Teammedlem</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {members.map((member, idx) => (
          <motion.div 
            key={member._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm group hover:shadow-2xl transition-all duration-500"
          >
            <div className="relative h-64 overflow-hidden">
              <img src={member.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={member.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button onClick={() => moveMember(idx, -1)} className="p-2 bg-white text-primary rounded-xl shadow-lg hover:bg-orange-500 hover:text-white transition-all"><MoveUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => moveMember(idx, 1)} className="p-2 bg-white text-primary rounded-xl shadow-lg hover:bg-orange-500 hover:text-white transition-all"><MoveDown className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">{member.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mt-1">{member.role}</p>
              </div>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => handleEdit(member)}
                  className="flex-1 bg-gray-50 text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  <Edit2 className="w-3.5 h-3.5" /> <span>Rediger</span>
                </button>
                <button 
                  onClick={() => handleDelete(member._id)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden relative z-10"
            >
              <form onSubmit={handleSave} className="flex flex-col h-full max-h-[90vh]">
                <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="text-2xl font-black text-primary uppercase tracking-tighter italic">
                    {editingMember?._id ? 'Rediger Teammedlem' : 'Nytt Teammedlem'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="w-full md:w-48 space-y-4">
                      <div className="relative aspect-square rounded-[3rem] overflow-hidden group">
                        <img src={editingMember.image} className="w-full h-full object-cover" alt="" />
                        <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Endre Bilde</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0])} />
                        </label>
                      </div>
                      <p className="text-[9px] text-center font-bold text-gray-400 uppercase tracking-widest">Kvadratisk bilde fungerer best</p>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Navn</label>
                        <input 
                          required
                          value={editingMember.name} 
                          onChange={e => setEditingMember({...editingMember, name: e.target.value})}
                          className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Rolle (f.eks Spesialist)</label>
                        <input 
                          required
                          value={editingMember.role} 
                          onChange={e => setEditingMember({...editingMember, role: e.target.value})}
                          className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center">Bio / Beskrivelse</label>
                    <textarea 
                      value={editingMember.bio} 
                      onChange={e => setEditingMember({...editingMember, bio: e.target.value})}
                      rows={4}
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Facebook className="w-3 h-3 mr-2" /> Facebook</label>
                      <input 
                        value={editingMember.socialLinks?.facebook} 
                        onChange={e => setEditingMember({...editingMember, socialLinks: {...editingMember.socialLinks, facebook: e.target.value}})}
                        className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-[10px] font-bold" 
                        placeholder="URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center"><Instagram className="w-3 h-3 mr-2" /> Instagram</label>
                      <input 
                        value={editingMember.socialLinks?.instagram} 
                        onChange={e => setEditingMember({...editingMember, socialLinks: {...editingMember.socialLinks, instagram: e.target.value}})}
                        className="w-full bg-gray-50 border-0 rounded-xl px-6 py-4 text-[10px] font-bold" 
                        placeholder="URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                  <button 
                    disabled={saving}
                    className="bg-primary text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center space-x-3 shadow-xl hover:bg-orange-500 transition-all disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Lagrer...' : 'Lagre Teammedlem'}</span>
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
