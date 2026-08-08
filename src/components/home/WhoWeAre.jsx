"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Users } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';
import { tr } from '@/lib/tr';

export default function WhoWeAre({ content }) {
  const { t, locale } = useLocale();
  return (
    <section className="py-40 bg-gray-50/50 overflow-hidden relative">
      {/* Decorative Background Text */}
      <div className="absolute top-20 -right-20 text-[15rem] font-black text-gray-100 uppercase tracking-tighter select-none pointer-events-none opacity-50">
        Nepal
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-24 relative z-10">
          
          {/* Image Side */}
          <div className="lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="grid grid-cols-2 gap-8"
            >
              <div className="pt-24">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-orange-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img 
                    src={content?.image1 || "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80"} 
                    alt="Nepal landscape" 
                    className="rounded-[3rem] shadow-2xl w-full h-[500px] object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img 
                    src={content?.image2 || "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&w=600&q=80"} 
                    alt="Nepal culture" 
                    className="rounded-[3rem] shadow-2xl w-full h-[500px] object-cover relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                  />
              </div>
            </motion.div>

            {/* Floating Stats */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-12 rounded-[3rem] text-center shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-gray-100 z-20 min-w-[200px]"
            >
              <span className="block text-7xl font-black text-primary leading-none mb-2">
                {content?.yearsOfExperience || '15'}
              </span>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-500 block">
                {tr(content, 'yearsOfExperienceLabel', locale) || t.whoWeAre.yearsLabel}
              </span>
              <div className="mt-6 flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Text Side */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-6 flex items-center">
                <span className="w-12 h-[2px] bg-orange-500 mr-4" /> {tr(content, 'subtitle', locale) || t.whoWeAre.subtitle}
              </h5>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary leading-tight mb-8 tracking-tight">
                {tr(content, 'title', locale) || t.whoWeAre.title}
              </h2>
              
              <div className="space-y-8 text-gray-500 leading-relaxed text-lg font-light">
                <p>
                  {tr(content, 'description', locale) || t.whoWeAre.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 p-3 rounded-2xl text-primary">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">{tr(content, 'feature1Title', locale) || t.whoWeAre.feature1Title}</h4>
                      <p className="text-xs">{tr(content, 'feature1Desc', locale) || t.whoWeAre.feature1Desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">{tr(content, 'feature2Title', locale) || t.whoWeAre.feature2Title}</h4>
                      <p className="text-xs">{tr(content, 'feature2Desc', locale) || t.whoWeAre.feature2Desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center space-x-10">
                <Link href="/om-oss" className="inline-block bg-primary text-white px-10 py-4.5 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition-all shadow-md">
                  {t.common.omOss}
                </Link>
                <div className="hidden sm:flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center p-3">
                    <Award className="text-orange-500 w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary leading-tight">{t.whoWeAre.certified}</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      <style jsx>{`
        .stroke-text-primary {
          -webkit-text-stroke: 1px #435735;
          color: transparent;
        }
      `}</style>
    </section>
  );
}
