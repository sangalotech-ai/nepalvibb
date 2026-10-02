"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/providers/useLocale';
import { tr } from '@/lib/tr';

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`;
  }
  return url;
}

export default function HeroBanner({ initialBanners }) {
  const { t, locale } = useLocale();

  const FALLBACK_BANNER = {
    title: t.hero.title,
    highlightText: t.hero.highlight,
    subtitle: t.hero.subtitle,
    badgeText: t.hero.badgeText,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80",
    buttonText: t.hero.bannerButton,
    buttonLink: "/turer"
  };
  const [banners, setBanners] = useState(initialBanners || []);
  const [current, setCurrent] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
    } else {
      fetch('/api/banners')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
          }
        })
        .catch(() => {});
    }
  }, [initialBanners]);

  useEffect(() => {
    if (banners.length <= 1 || activeVideo) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners.length, activeVideo]);

  // Close video on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    if (activeVideo) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo]);

  const allBanners = banners.length > 0 ? banners : [FALLBACK_BANNER];
  const currentBanner = allBanners[current] || allBanners[0] || FALLBACK_BANNER;

  const handleOpenVideo = (url) => {
    if (!url) return;
    setActiveVideo(url);
  };

  const embedUrl = activeVideo ? getEmbedUrl(activeVideo) : null;
  const isDirectVideo = activeVideo && /\.(mp4|webm|ogg)($|\?)/i.test(activeVideo);

  return (
    <>
      <link rel="preload" as="image" href={currentBanner.image} fetchPriority="high" />
      <div className="relative h-[100svh] min-h-[650px] flex items-center overflow-hidden bg-black">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={currentBanner.image} alt="" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12 pt-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-300 text-[11px] font-bold uppercase tracking-[0.25em]">
              {tr(currentBanner, 'badgeText', locale) || t.hero.badgeFallback}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display text-white leading-[1.1] tracking-tight">
            {tr(currentBanner, 'title', locale)}{' '}
            {tr(currentBanner, 'highlightText', locale) && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-amber-200">
                {tr(currentBanner, 'highlightText', locale)}
              </span>
            )}{' '}
            {tr(currentBanner, 'subtitle', locale)}
          </h1>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-10">
            <Link
              href={currentBanner.buttonLink || "/trips"}
              className="group inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 text-xs font-black uppercase tracking-[0.25em] rounded-full shadow-[0_15px_35px_rgba(249,115,22,0.35)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.45)] hover:scale-105 transition-all duration-300"
            >
              {tr(currentBanner, 'buttonText', locale) || t.hero.buttonFallback}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>

            {currentBanner.videoLink && (
              <button
                type="button"
                onClick={() => handleOpenVideo(currentBanner.videoLink)}
                className="inline-flex items-center gap-4 text-white/70 hover:text-white transition-colors group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white group-hover:text-primary transition-all duration-300 shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em]">{t.common.seVideo}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {allBanners.length > 1 && (
        <div className="absolute inset-0 z-20 pointer-events-none group/arrows">
          <div className="relative h-full max-w-7xl mx-auto px-4">
            <button
              onClick={() => setCurrent(prev => (prev - 1 + allBanners.length) % allBanners.length)}
              className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover/arrows:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrent(prev => (prev + 1) % allBanners.length)}
              className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover/arrows:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Slide indicators */}
      {allBanners.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {allBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-500 cursor-pointer",
                i === current
                  ? "bg-orange-500 w-10 h-2"
                  : "bg-white/30 hover:bg-white/50 w-2 h-2"
              )}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center gap-3 text-white/30 z-20">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] [writing-mode:vertical-lr]">{t.common.scroll}</span>
        <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent" />
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>

            {isDirectVideo ? (
              <video
                src={activeVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title="Banner Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
                <p className="text-lg font-semibold">Cannot preview this video URL in embed mode.</p>
                <a 
                  href={activeVideo} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-sm uppercase tracking-wider"
                >
                  Open video in new tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
