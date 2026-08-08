"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck } from 'lucide-react';
import { tr } from '@/lib/tr';
import { useLocale } from '@/components/providers/useLocale';

export default function LegalContentPage({ slug }) {
  const { locale } = useLocale();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/legal/${slug}`)
      .then(res => res.json())
      .then(data => setDoc(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const isPrivacy = slug === 'personvern';
  const Icon = isPrivacy ? ShieldCheck : FileText;

  if (loading) return (
    <div className="min-h-screen bg-stone-50/30 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/10 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50/30">
      <div className="relative h-[45vh] md:h-[55vh] min-h-[360px] flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-900 to-black opacity-95" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Icon className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-white tracking-tight leading-tight">
            {tr(doc, 'title', locale) || (isPrivacy ? 'Personvern' : 'Betingelser')}
          </h1>
          <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-emerald-200 hover:text-white transition-colors mt-8">
            &larr; Tilbake til forsiden
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <article className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-12 md:p-16">
          <div
            className="prose prose-lg max-w-none text-gray-600 font-light leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:font-display [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-primary [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2"
            dangerouslySetInnerHTML={{ __html: tr(doc, 'content', locale) }}
          />
        </article>
      </div>
    </div>
  );
}
