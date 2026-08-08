"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Globe, Award, Heart, 
  Sparkles, ChevronRight, Compass, Facebook, 
  Instagram, Linkedin, Twitter, X 
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { tr, trItem } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

export default function AboutPage() {
  const { locale } = useLocale();
  const [content, setContent] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setSelectedMember(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedMember]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, teamRes] = await Promise.all([
          fetch('/api/about-content'),
          fetch('/api/team-members')
        ]);
        const aboutData = await aboutRes.json();
        const teamData = await teamRes.json();
        setContent(aboutData);
        setTeam(teamData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const values = content?.values?.map(v => ({
    ...v,
    icon: v.icon === 'Compass' ? Compass : v.icon === 'Globe' ? Globe : Sparkles,
    color: v.icon === 'Compass' ? 'text-orange-500' : v.icon === 'Globe' ? 'text-emerald-500' : 'text-blue-500',
    bg: v.icon === 'Compass' ? 'bg-orange-50' : v.icon === 'Globe' ? 'bg-emerald-50' : 'bg-blue-50'
  })) || [];

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={content?.hero?.image} 
            className="w-full h-full object-cover" 
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs">
              {tr(content?.hero, 'subtitle', locale)}
            </h5>
            <h1 className="text-4xl md:text-7xl font-bold font-display text-white tracking-tight leading-tight drop-shadow-2xl max-w-4xl mx-auto">
              {tr(content?.hero, 'title', locale)}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight">
              {tr(content?.mission, 'title', locale)}
            </h2>
            <div className="space-y-6 text-lg text-gray-600 font-light leading-relaxed border-l-2 border-orange-500 pl-6">
              <p>{tr(content?.mission, 'description', locale)}</p>
            </div>
            <div className="flex items-center space-x-12 pt-4">
              {content?.mission?.stats?.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-4xl font-bold text-primary">{stat.number}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{trItem(stat, 'label', locale)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative h-[450px] sm:h-[600px] rounded-3xl overflow-hidden shadow-xl">
              <img 
                src={content?.mission?.image} 
                className="w-full h-full object-cover" 
                alt="Mission"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-3 max-w-xs border border-gray-100">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <p className="text-sm font-light text-primary leading-relaxed">
                {tr(content?.mission, 'quote', locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-20 md:py-32 overflow-hidden bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-3">
              <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs">Menneskene bak</h5>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight">Vårt Ekspertteam</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, i) => (
                <motion.div 
                  key={member._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-md mb-6">
                    <img src={member.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={member.name} loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                      <div className="flex space-x-4">
                        {member.socialLinks?.facebook && <a href={member.socialLinks.facebook} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-white hover:text-orange-500"><Facebook className="w-5 h-5" /></a>}
                        {member.socialLinks?.instagram && <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-white hover:text-orange-500"><Instagram className="w-5 h-5" /></a>}
                        {member.socialLinks?.linkedin && <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-white hover:text-orange-500"><Linkedin className="w-5 h-5" /></a>}
                        {member.socialLinks?.twitter && <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-white hover:text-orange-500"><Twitter className="w-5 h-5" /></a>}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-4">Se profil →</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary tracking-tight mb-1">{member.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">{member.role}</p>
                    {member.bio && <p className="text-xs text-gray-500 mt-3 line-clamp-2 px-4 leading-relaxed font-light">&ldquo;{member.bio}&rdquo;</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values Grid */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight">{tr(content, 'valuesTitle', locale)}</h2>
            <p className="text-gray-500 font-light max-w-xl mx-auto text-base">{tr(content, 'valuesSubtitle', locale)}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-primary/10 hover:shadow-lg transition-all group">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform", v.bg)}>
                  <v.icon className={cn("w-6 h-6", v.color)} />
                </div>
                <h3 className="text-lg font-bold text-primary tracking-tight mb-3">{trItem(v, 'title', locale)}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed">{trItem(v, 'desc', locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-20 max-w-7xl mx-auto px-6 text-center">
        <div className="bg-primary rounded-3xl p-10 sm:p-16 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1551882547-ff43c63faf76?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="" loading="lazy" />
          </div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-tight">
              Klar for ditt<br />neste eventyr?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link href="/plan-your-trip" className="bg-orange-500 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-orange-600 hover:scale-105 transition-all">
                Planlegg reisen
              </Link>
              <Link href="/kontakt-oss" className="text-white text-xs font-bold uppercase tracking-wider hover:text-orange-500 transition-colors">
                Kontakt oss →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team Member Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedMember(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedMember(null)}
                aria-label="Lukk"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-primary flex items-center justify-center shadow-md transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="relative md:col-span-2 h-64 md:h-auto">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent md:bg-gradient-to-r" />
                </div>
                <div className="md:col-span-3 p-8 sm:p-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500 mb-2">
                    {selectedMember.role}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight mb-5">
                    {selectedMember.name}
                  </h3>
                  <div className="space-y-4 text-gray-600 font-light leading-relaxed text-sm sm:text-base">
                    {selectedMember.bio ? (
                      <p>{selectedMember.bio}</p>
                    ) : (
                      <p>Vi er stolte av å ha {selectedMember.name} på teamet hos Nepalvibb.</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mt-8 pt-6 border-t border-gray-100">
                    {selectedMember.socialLinks?.facebook && (
                      <a href={selectedMember.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-600 flex items-center justify-center transition-all">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {selectedMember.socialLinks?.instagram && (
                      <a href={selectedMember.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-600 flex items-center justify-center transition-all">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {selectedMember.socialLinks?.linkedin && (
                      <a href={selectedMember.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-600 flex items-center justify-center transition-all">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {selectedMember.socialLinks?.twitter && (
                      <a href={selectedMember.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-600 flex items-center justify-center transition-all">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
