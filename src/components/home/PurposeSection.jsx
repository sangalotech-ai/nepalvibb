"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';
import { tr } from '@/lib/tr';

export default function PurposeSection({ content }) {
  const { t, locale } = useLocale();
  const purpose = content || {};

  const subtitle = tr(purpose, 'subtitle', locale) || (locale === 'en' ? 'Social Responsibility' : 'Vårt samfunnsansvar');
  const title = tr(purpose, 'title', locale) || (locale === 'en' ? 'A Journey with Purpose: Your Adventure – Their Hope' : 'En Reise med Formål: Ditt Eventyr – Deres Håp');
  const description = tr(purpose, 'description', locale) || (locale === 'en' ? 'We support local street dog rescue initiatives in Nepal. By traveling with us, you directly help give these animals a better life through Actual Adventure Foundation.' : 'Vi støtter lokale prosjekter for gatehunder i Nepal. Ved å reise med oss bidrar du direkte til å gi disse dyrene et bedre liv gjennom Actual Adventure Foundation.');
  const buttonText = tr(purpose, 'buttonText', locale) || (locale === 'en' ? 'Read more about the project' : 'Les mer om prosjektet');
  const travelersLabel = tr(purpose, 'travelersLabel', locale) || (locale === 'en' ? 'happy travelers' : 'reisende fornøyd');

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-emerald-900"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
        <img
          src={purpose.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80'}
          alt=""
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
      </div>

      <div className="absolute top-10 -left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 max-w-xl space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <span className="text-orange-300 font-bold uppercase tracking-widest text-[10px]">
                {subtitle}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-white tracking-tight leading-[1.1]">
              {title}
            </h2>

            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>

            <p className="text-white/70 text-lg font-light leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
              <Link
                href={purpose.buttonLink || '/om-prosjektet'}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-full shadow-[0_15px_35px_rgba(249,115,22,0.4)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {buttonText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                href="/turer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-full hover:bg-white/5"
              >
                {locale === 'en' ? 'Explore our tours' : 'Utforsk våre turer'}
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-emerald-500/20 rounded-[2.5rem] blur-xl"></div>
              <div className="relative aspect-[4/3] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={purpose.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80'}
                  alt="Nepal adventure"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent"></div>

                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-9 h-9 rounded-full border-2 border-white/30 bg-orange-500/30 flex items-center justify-center text-white text-[9px] font-bold">+{i * 2}</div>
                      ))}
                    </div>
                    <div className="text-white text-xs font-light">
                      <span className="font-bold text-orange-300">{purpose.travelersValue || '200+'}</span>{' '}
                      {travelersLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
