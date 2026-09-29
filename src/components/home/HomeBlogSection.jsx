"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/components/providers/useLocale';
import { tr } from '@/lib/tr';
import LatestBlogs from '@/components/home/LatestBlogs';

export default function HomeBlogSection({ content, initialBlogs = [] }) {
  const { t, locale } = useLocale();
  const blogContent = content || {};

  const subtitle = tr(blogContent, 'subtitle', locale) || t.blogList.tipsInspirasjon || (locale === 'en' ? 'Tips & Inspiration' : 'Tips & Inspirasjon');
  const title = tr(blogContent, 'title', locale) || t.blogList.title || (locale === 'en' ? 'Stories from the Himalayas' : 'Historier fra Himalaya');

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h5 className="text-orange-500 font-bold uppercase tracking-wider text-xs mb-3">
            {subtitle}
          </h5>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary tracking-tight leading-tight">
            {title}
          </h2>
        </div>
        
        <LatestBlogs initialBlogs={initialBlogs} />

        <div className="mt-12 text-center">
          <Link href="/blogg" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-orange-500 transition-colors group">
            <span>{locale === 'en' ? 'See all articles' : 'Se alle artikler'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
